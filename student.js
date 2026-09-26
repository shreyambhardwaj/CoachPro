// ==========================================
// COACHPRO - STUDENT MANAGEMENT
// ==========================================


// ==========================================
// LOAD STUDENTS
// ==========================================

let students = JSON.parse(localStorage.getItem("students")) || [];


// ==========================================
// OPEN STUDENT FORM
// ==========================================

function openStudentForm() {

    const form = document.getElementById("studentForm");

    if (form) {
        form.classList.add("show");
    }
}


// ==========================================
// CLOSE STUDENT FORM
// ==========================================

function closeStudentForm() {

    const form = document.getElementById("studentForm");

    if (form) {
        form.classList.remove("show");
    }
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// ==========================================
// GENERATE MONTHLY FEE RECORDS
// ==========================================

function generateFeeRecords(admissionDate, monthlyFees) {

    const fees = [];

    const startDate = new Date(admissionDate);

    const today = new Date();

    let currentDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1
    );

    const lastMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );


    while (currentDate <= lastMonth) {

        const year = currentDate.getFullYear();

        const month = String(
            currentDate.getMonth() + 1
        ).padStart(2, "0");


        fees.push({

            id: Date.now() + fees.length,

            month: `${year}-${month}`,

            amount: Number(monthlyFees),

            status: "Pending",

            paymentDate: null

        });


        currentDate.setMonth(
            currentDate.getMonth() + 1
        );
    }


    return fees;
}


// ==========================================
// GET FEE RECORDS
// ==========================================
// This function handles BOTH:
// old student data
// AND
// new monthly fee data
// ==========================================

function getStudentFees(student) {

    // New format
    if (Array.isArray(student.fees)) {

        return student.fees;

    }


    // Old format
    // Convert old fee value into one fee record

    const oldAmount =
        Number(
            student.monthlyFees || student.fees || 0
        );


    let oldStatus =
        student.status || "Pending";


    return [

        {

            id: Date.now(),

            month:
                student.admissionDate
                    ? student.admissionDate.substring(0, 7)
                    : new Date().toISOString().substring(0, 7),

            amount: oldAmount,

            status: oldStatus,

            paymentDate: null

        }

    ];
}


// ==========================================
// ADD STUDENT
// ==========================================

const studentFormData =
    document.getElementById("studentFormData");


if (studentFormData) {

    studentFormData.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // Get form values

            const name =
                document.getElementById("studentName")
                    .value
                    .trim();


            const phone =
                document.getElementById("studentPhone")
                    .value
                    .trim();


            const course =
                document.getElementById("studentCourse")
                    .value;


            const monthlyFees =
                Number(
                    document.getElementById("studentFees")
                        .value
                );


            const admissionDate =
                document.getElementById("studentDate")
                    .value;


            // Validation

            if (
                !name ||
                !phone ||
                !course ||
                !monthlyFees ||
                !admissionDate
            ) {

                alert("Please fill all fields.");

                return;

            }


            // Generate monthly fees

            const feeRecords =
                generateFeeRecords(
                    admissionDate,
                    monthlyFees
                );


            // Create student

            const student = {

                id: Date.now(),

                name: name,

                phone: phone,

                course: course,

                monthlyFees: monthlyFees,

                admissionDate: admissionDate,

                fees: feeRecords

            };


            // Add to array

            students.push(student);


            // Save to localStorage

            localStorage.setItem(
                "students",
                JSON.stringify(students)
            );


            // Reset form

            studentFormData.reset();


            // Close form

            closeStudentForm();


            // Show updated students

            displayStudents();


            alert(
                "Student added successfully!"
            );

        }
    );
}


// ==========================================
// DISPLAY STUDENTS
// ==========================================

function displayStudents(
    filteredStudents = students
) {

    const tableBody =
        document.getElementById(
            "studentTableBody"
        );


    const studentCount =
        document.getElementById(
            "studentCount"
        );


    if (!tableBody) {
        return;
    }


    // Clear table

    tableBody.innerHTML = "";


    // Student count

    if (studentCount) {

        studentCount.textContent =
            `${filteredStudents.length} Students`;

    }


    // No students

    if (filteredStudents.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="no-data"
                >

                    No students found

                </td>

            </tr>

        `;

        return;
    }


    // Create rows

    filteredStudents.forEach(
        function (student) {


            // Get fees safely

            const feeRecords =
                getStudentFees(student);


            // Calculate totals

            let paidAmount = 0;

            let pendingAmount = 0;


            feeRecords.forEach(
                function (fee) {

                    const amount =
                        Number(fee.amount) || 0;


                    if (
                        fee.status === "Paid"
                    ) {

                        paidAmount += amount;

                    } else {

                        pendingAmount += amount;

                    }

                }
            );


            // Monthly fees

            const monthlyFees =
                Number(
                    student.monthlyFees ||
                    student.fees ||
                    0
                );


            // Create row

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <strong>
                        ${student.name}
                    </strong>

                </td>


                <td>
                    ${student.phone}
                </td>


                <td>

                    <span class="course-badge">

                        ${student.course}

                    </span>

                </td>


                <td>

                    ₹${monthlyFees.toLocaleString(
                        "en-IN"
                    )}

                </td>


                <td>

                    <span class="paid-badge">

                        ₹${paidAmount.toLocaleString(
                            "en-IN"
                        )}

                    </span>

                </td>


                <td>

                    <span class="pending-badge">

                        ₹${pendingAmount.toLocaleString(
                            "en-IN"
                        )}

                    </span>

                </td>


                <td>

                    ${formatDate(
                        student.admissionDate
                    )}

                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="view-btn"
                            onclick="viewStudentFees(${student.id})"
                        >
                            💰 Fees
                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteStudent(${student.id})"
                        >
                            🗑
                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );
}


// ==========================================
// DELETE STUDENT
// ==========================================

function deleteStudent(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this student?"
        );


    if (!confirmDelete) {
        return;
    }


    students =
        students.filter(
            function (student) {

                return student.id !== id;

            }
        );


    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );


    displayStudents();

}


// ==========================================
// OPEN STUDENT FEES
// ==========================================

function viewStudentFees(id) {

    localStorage.setItem(
        "selectedStudentId",
        id
    );


    window.location.href =
        "/coachpro/pages/fees.html";

}


// ==========================================
// SEARCH STUDENT
// ==========================================

const searchStudent =
    document.getElementById(
        "searchStudent"
    );


if (searchStudent) {

    searchStudent.addEventListener(
        "input",
        function () {

            const searchText =
                searchStudent.value
                    .toLowerCase()
                    .trim();


            const filteredStudents =
                students.filter(
                    function (student) {

                        return (

                            student.name
                                .toLowerCase()
                                .includes(searchText)

                            ||

                            student.phone
                                .includes(searchText)

                            ||

                            student.course
                                .toLowerCase()
                                .includes(searchText)

                        );

                    }
                );


            displayStudents(
                filteredStudents
            );

        }
    );
}


// ==========================================
// INITIAL LOAD
// ==========================================

displayStudents();
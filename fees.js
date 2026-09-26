// ==========================================
// COACHPRO - FEES MANAGEMENT
// ==========================================


// ==========================================
// LOAD STUDENTS
// ==========================================

let students =
    JSON.parse(localStorage.getItem("students")) || [];


// ==========================================
// SELECTED STUDENT
// ==========================================

let selectedStudentId =
    localStorage.getItem("selectedStudentId");


// ==========================================
// ELEMENTS
// ==========================================

const studentSelect =
    document.getElementById("studentSelect");

const selectedCourse =
    document.getElementById("selectedCourse");

const selectedMonthlyFee =
    document.getElementById("selectedMonthlyFee");

const feeTableBody =
    document.getElementById("feeTableBody");


// ==========================================
// FORMAT MONEY
// ==========================================

function formatMoney(amount) {

    return Number(amount || 0)
        .toLocaleString("en-IN");
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date =
        new Date(dateString);

    if (isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ==========================================
// FORMAT MONTH
// ==========================================

function formatMonth(month) {

    if (!month) {
        return "-";
    }

    const date =
        new Date(month + "-01");

    return date.toLocaleDateString(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    );
}


// ==========================================
// GENERATE FEE RECORDS FOR OLD STUDENTS
// ==========================================

function createFeeRecordsIfMissing(student) {

    // Already new format
    if (Array.isArray(student.fees)) {
        return;
    }


    const amount =
        Number(
            student.monthlyFees ||
            student.fees ||
            0
        );


    const admissionDate =
        student.admissionDate;


    if (!admissionDate) {

        student.fees = [];

        return;

    }


    const fees = [];

    const startDate =
        new Date(admissionDate);

    const today =
        new Date();


    let currentDate =
        new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            1
        );


    const lastMonth =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );


    while (currentDate <= lastMonth) {

        const year =
            currentDate.getFullYear();

        const month =
            String(
                currentDate.getMonth() + 1
            ).padStart(2, "0");


        fees.push({

            id:
                Date.now() +
                fees.length,

            month:
                `${year}-${month}`,

            amount:
                amount,

            status:
                "Pending",

            paymentDate:
                null

        });


        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

    }


    student.monthlyFees =
        amount;

    student.fees =
        fees;
}


// ==========================================
// SAVE STUDENTS
// ==========================================

function saveStudents() {

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );

}


// ==========================================
// LOAD STUDENTS INTO SELECT
// ==========================================

function loadStudents() {

    if (!studentSelect) {
        return;
    }


    studentSelect.innerHTML = `

        <option value="">
            Select a student
        </option>

    `;


    students.forEach(
        function (student) {

            const option =
                document.createElement("option");


            option.value =
                student.id;


            option.textContent =
                `${student.name} - ${student.course}`;


            studentSelect.appendChild(
                option
            );

        }
    );


    // Opened from Students page
    if (selectedStudentId) {

        studentSelect.value =
            selectedStudentId;


        showStudentFees(
            selectedStudentId
        );

    }

}


// ==========================================
// STUDENT SELECT CHANGE
// ==========================================

if (studentSelect) {

    studentSelect.addEventListener(
        "change",
        function () {

            const id =
                studentSelect.value;


            if (!id) {

                clearFeePage();

                return;

            }


            localStorage.setItem(
                "selectedStudentId",
                id
            );


            showStudentFees(id);

        }
    );

}


// ==========================================
// SHOW STUDENT FEES
// ==========================================

function showStudentFees(id) {

    const student =
        students.find(
            function (item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!student) {

        clearFeePage();

        return;

    }


    // Make sure fee records exist

    createFeeRecordsIfMissing(
        student
    );


    saveStudents();


    // Student information

    selectedCourse.textContent =
        `Course: ${student.course}`;


    selectedMonthlyFee.textContent =
        `Monthly Fee: ₹${formatMoney(
            student.monthlyFees
        )}`;


    // Display fees

    displayFeeTable(
        student
    );


    // Summary

    updateSummary(
        student
    );

}


// ==========================================
// DISPLAY FEE TABLE
// ==========================================

function displayFeeTable(student) {

    if (!feeTableBody) {
        return;
    }


    feeTableBody.innerHTML = "";


    if (
        !student.fees ||
        student.fees.length === 0
    ) {

        feeTableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-fees"
                >

                    No fee records found.

                </td>

            </tr>

        `;

        return;

    }


    student.fees.forEach(
        function (fee) {

            const row =
                document.createElement("tr");


            let statusHTML = "";

            let actionHTML = "";


            // PAID

            if (fee.status === "Paid") {

                statusHTML = `

                    <span
                        class="status-badge status-paid"
                    >
                        ● Paid
                    </span>

                `;


                actionHTML = `

                    <button
                        class="undo-paid-btn"
                        onclick="markPending(${student.id}, ${fee.id})"
                    >
                        Mark Pending
                    </button>

                `;

            }


            // PENDING

            else {

                statusHTML = `

                    <span
                        class="status-badge status-pending"
                    >
                        ● Pending
                    </span>

                `;


                actionHTML = `

                    <button
                        class="mark-paid-btn"
                        onclick="markPaid(${student.id}, ${fee.id})"
                    >
                        ✓ Mark Paid
                    </button>

                `;

            }


            row.innerHTML = `

                <td>
                    <strong>
                        ${formatMonth(fee.month)}
                    </strong>
                </td>


                <td>
                    ₹${formatMoney(fee.amount)}
                </td>


                <td>
                    ${statusHTML}
                </td>


                <td>
                    ${formatDate(fee.paymentDate)}
                </td>


                <td>
                    ${actionHTML}
                </td>

            `;


            feeTableBody.appendChild(
                row
            );

        }
    );

}


// ==========================================
// UPDATE SUMMARY
// ==========================================

function updateSummary(student) {

    let totalFees = 0;

    let paidFees = 0;

    let pendingFees = 0;

    let paidMonths = 0;

    let pendingMonths = 0;


    student.fees.forEach(
        function (fee) {

            const amount =
                Number(fee.amount) || 0;


            totalFees += amount;


            if (fee.status === "Paid") {

                paidFees += amount;

                paidMonths++;

            } else {

                pendingFees += amount;

                pendingMonths++;

            }

        }
    );


    document.getElementById(
        "totalFees"
    ).textContent =
        `₹${formatMoney(totalFees)}`;


    document.getElementById(
        "paidFees"
    ).textContent =
        `₹${formatMoney(paidFees)}`;


    document.getElementById(
        "pendingFees"
    ).textContent =
        `₹${formatMoney(pendingFees)}`;


    document.getElementById(
        "paidMonths"
    ).textContent =
        paidMonths;


    document.getElementById(
        "pendingMonths"
    ).textContent =
        pendingMonths;

}


// ==========================================
// MARK PAID
// ==========================================

function markPaid(
    studentId,
    feeId
) {

    const student =
        students.find(
            function (item) {

                return String(item.id) ===
                    String(studentId);

            }
        );


    if (!student) {
        return;
    }


    const fee =
        student.fees.find(
            function (item) {

                return String(item.id) ===
                    String(feeId);

            }
        );


    if (!fee) {
        return;
    }


    fee.status =
        "Paid";


    fee.paymentDate =
        new Date().toISOString();


    saveStudents();


    showStudentFees(
        studentId
    );


    alert(
        "Fee marked as Paid successfully!"
    );

}


// ==========================================
// MARK PENDING / UNDO
// ==========================================

function markPending(
    studentId,
    feeId
) {

    const student =
        students.find(
            function (item) {

                return String(item.id) ===
                    String(studentId);

            }
        );


    if (!student) {
        return;
    }


    const fee =
        student.fees.find(
            function (item) {

                return String(item.id) ===
                    String(feeId);

            }
        );


    if (!fee) {
        return;
    }


    fee.status =
        "Pending";


    fee.paymentDate =
        null;


    saveStudents();


    showStudentFees(
        studentId
    );

}


// ==========================================
// CLEAR PAGE
// ==========================================

function clearFeePage() {

    selectedCourse.textContent =
        "Course: -";


    selectedMonthlyFee.textContent =
        "Monthly Fee: ₹0";


    document.getElementById(
        "totalFees"
    ).textContent =
        "₹0";


    document.getElementById(
        "paidFees"
    ).textContent =
        "₹0";


    document.getElementById(
        "pendingFees"
    ).textContent =
        "₹0";


    document.getElementById(
        "paidMonths"
    ).textContent =
        "0";


    document.getElementById(
        "pendingMonths"
    ).textContent =
        "0";


    feeTableBody.innerHTML = `

        <tr>

            <td
                colspan="5"
                class="empty-fees"
            >

                👆 Select a student
                to view fees

            </td>

        </tr>

    `;

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadStudents();
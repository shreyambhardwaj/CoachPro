// =====================================================
// COACHPRO REPORTS
// REAL DATA FROM LOCAL STORAGE
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    loadReports();

});


// =====================================================
// MAIN REPORT FUNCTION
// =====================================================

function loadReports() {

    const students =
        JSON.parse(localStorage.getItem("students")) || [];

    const attendance =
        JSON.parse(localStorage.getItem("attendance")) || {};


    // -----------------------------
    // TOTAL STUDENTS
    // -----------------------------

    setText(
        "reportTotalStudents",
        students.length
    );


    setText(
        "overviewTotal",
        students.length
    );


    // -----------------------------
    // COURSE COUNTS
    // -----------------------------

    const spoken =
        students.filter(function (student) {

            return student.course === "Spoken English";

        });


    const computer =
        students.filter(function (student) {

            return student.course === "Pro Computer";

        });


    setText(
        "reportSpokenCount",
        spoken.length + " Students"
    );


    setText(
        "reportComputerCount",
        computer.length + " Students"
    );


    // -----------------------------
    // COURSE PROGRESS
    // -----------------------------

    let spokenPercentage = 0;

    let computerPercentage = 0;


    if (students.length > 0) {

        spokenPercentage =
            Math.round(
                (spoken.length / students.length) * 100
            );


        computerPercentage =
            Math.round(
                (computer.length / students.length) * 100
            );

    }


    const spokenProgress =
        document.getElementById(
            "reportSpokenProgress"
        );


    const computerProgress =
        document.getElementById(
            "reportComputerProgress"
        );


    if (spokenProgress) {

        spokenProgress.style.width =
            spokenPercentage + "%";

    }


    if (computerProgress) {

        computerProgress.style.width =
            computerPercentage + "%";

    }


    // -----------------------------
    // TODAY ATTENDANCE
    // -----------------------------

    const today =
        getTodayDate();


    const todayAttendance =
        attendance[today] || {};


    let present = 0;

    let absent = 0;


    students.forEach(function (student) {

        const status =
            todayAttendance[
                String(student.id)
            ];


        if (status === "Present") {

            present++;

        }


        if (status === "Absent") {

            absent++;

        }

    });


    const marked =
        present + absent;


    const percentage =
        marked > 0
            ? Math.round(
                (present / marked) * 100
            )
            : 0;


    setText(
        "reportPresentToday",
        present
    );


    setText(
        "reportAttendancePercentage",
        percentage + "%"
    );


    setText(
        "overviewPresent",
        present
    );


    setText(
        "overviewAbsent",
        absent
    );


    setText(
        "overviewPercentage",
        percentage + "%"
    );


    // -----------------------------
    // FEES
    // -----------------------------

    calculateReportFees(students);


    // -----------------------------
    // STUDENT LIST
    // -----------------------------

    displayReportStudents(students);

}


// =====================================================
// FEES
// =====================================================

function calculateReportFees(students) {

    let paid = 0;

    let pending = 0;


    students.forEach(function (student) {

        const fees =
            getStudentFees(student);


        fees.forEach(function (fee) {

            const amount =
                Number(fee.amount) || 0;


            if (fee.status === "Paid") {

                paid += amount;

            }


            if (fee.status === "Pending") {

                pending += amount;

            }

        });

    });


    const total =
        paid + pending;


    setText(
        "reportPaidFees",
        formatMoney(paid)
    );


    setText(
        "reportPendingFees",
        formatMoney(pending)
    );


    setText(
        "reportTotalFees",
        formatMoney(total)
    );


    setText(
        "reportFeesCollected",
        formatMoney(paid)
    );

}


// =====================================================
// GET FEES
// =====================================================

function getStudentFees(student) {

    if (Array.isArray(student.fees)) {

        return student.fees;

    }


    // Old student format support

    if (
        typeof student.fees === "number"
    ) {

        return [

            {

                amount: student.fees,

                status:
                    student.feesStatus ||
                    "Pending"

            }

        ];

    }


    return [];

}


// =====================================================
// STUDENT REPORT
// =====================================================

function displayReportStudents(students) {

    const container =
        document.getElementById(
            "reportStudentsTable"
        );


    if (!container) {

        return;

    }


    if (students.length === 0) {

        container.innerHTML = `

            <div class="report-empty">

                👨‍🎓 No students added yet.

            </div>

        `;

        return;

    }


    // Latest students first

    const recentStudents =
        [...students]
            .reverse()
            .slice(0, 10);


    container.innerHTML = "";


    recentStudents.forEach(function (student) {

        const name =
            student.name || "Student";


        const firstLetter =
            name
                .charAt(0)
                .toUpperCase();


        const fees =
            getStudentFees(student);


        const currentMonth =
            getCurrentMonth();


        const currentFee =
            fees.find(function (fee) {

                return fee.month === currentMonth;

            });


        let feeStatus = "Pending";


        if (
            currentFee &&
            currentFee.status === "Paid"
        ) {

            feeStatus = "Paid";

        }


        const monthlyFee =
            currentFee
                ? Number(currentFee.amount) || 0
                : Number(student.monthlyFees) || 0;


        const row =
            document.createElement("div");


        row.className =
            "report-student-row";


        row.innerHTML = `

            <div class="report-student-info">

                <div class="report-student-avatar">

                    ${escapeHTML(firstLetter)}

                </div>


                <div>

                    <strong>

                        ${escapeHTML(name)}

                    </strong>

                    <small>

                        ${escapeHTML(
                            student.phone || "-"
                        )}

                    </small>

                </div>

            </div>


            <div class="report-course">

                ${escapeHTML(
                    student.course || "-"
                )}

            </div>


            <div>

                ₹${monthlyFee.toLocaleString("en-IN")}

            </div>


            <div
                class="report-fee ${
                    feeStatus === "Paid"
                        ? "paid"
                        : "pending"
                }"
            >

                ${feeStatus}

            </div>

        `;


        container.appendChild(row);

    });

}


// =====================================================
// TODAY
// =====================================================

function getTodayDate() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


// =====================================================
// CURRENT MONTH
// =====================================================

function getCurrentMonth() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    return `${year}-${month}`;

}


// =====================================================
// MONEY
// =====================================================

function formatMoney(amount) {

    return "₹" +
        Number(amount || 0)
            .toLocaleString("en-IN");

}


// =====================================================
// SET TEXT
// =====================================================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}
// ================================
// CoachPro - Dashboard
// Real Data Sync
// ================================

document.addEventListener("DOMContentLoaded", function () {
    loadDashboard();
});

function loadDashboard() {

    // -------------------------------
    // GET DATA FROM LOCAL STORAGE
    // -------------------------------

    const students = JSON.parse(localStorage.getItem("students")) || [];
    const attendance = JSON.parse(localStorage.getItem("attendance")) || {};


    // -------------------------------
    // TOTAL STUDENTS
    // -------------------------------

    const totalStudents = students.length;

    setText("dashboardTotalStudents", totalStudents);


    // -------------------------------
    // COURSE STUDENTS
    // -------------------------------

    const spokenStudents = students.filter(student =>
        student.course === "Spoken English"
    ).length;

    const computerStudents = students.filter(student =>
        student.course === "Pro Computer"
    ).length;

    setText("spokenStudents", spokenStudents);
    setText("computerStudents", computerStudents);


    // -------------------------------
    // COURSE PERCENTAGE
    // -------------------------------

    let spokenPercentage = 0;
    let computerPercentage = 0;

    if (totalStudents > 0) {
        spokenPercentage =
            Math.round((spokenStudents / totalStudents) * 100);

        computerPercentage =
            Math.round((computerStudents / totalStudents) * 100);
    }

    setText("spokenProgress", spokenPercentage + "%");
    setText("computerProgress", computerPercentage + "%");


    // -------------------------------
    // TODAY ATTENDANCE
    // -------------------------------

    const today = getToday();

    const todayAttendance = attendance[today] || {};

    let present = 0;
    let absent = 0;

    Object.values(todayAttendance).forEach(status => {

        if (status === "Present") {
            present++;
        }

        if (status === "Absent") {
            absent++;
        }

    });


    // -------------------------------
    // ATTENDANCE PERCENTAGE
    // -------------------------------

    const attendanceMarked = present + absent;

    let attendancePercentage = 0;

    if (attendanceMarked > 0) {
        attendancePercentage =
            Math.round((present / attendanceMarked) * 100);
    }

    setText("dashboardPresent", present);

    setText(
        "dashboardAttendancePercentage",
        attendancePercentage + "%"
    );


    // -------------------------------
    // FEES CALCULATION
    // -------------------------------

    let totalPaid = 0;
    let totalPending = 0;

    students.forEach(student => {

        let fees = [];

        // New fee system
        if (Array.isArray(student.fees)) {
            fees = student.fees;
        }

        // Old fee system
        else if (typeof student.fees === "number") {

            fees = [{
                amount: student.fees,
                status: "Paid"
            }];

        }


        fees.forEach(fee => {

            const amount = Number(fee.amount) || 0;

            if (fee.status === "Paid") {
                totalPaid += amount;
            }

            if (fee.status === "Pending") {
                totalPending += amount;
            }

        });

    });


    // -------------------------------
    // DISPLAY FEES
    // -------------------------------

    setText(
        "dashboardFeesCollected",
        formatMoney(totalPaid)
    );

    setText(
        "dashboardFeesPending",
        formatMoney(totalPending)
    );


    // -------------------------------
    // PENDING STUDENTS
    // -------------------------------

    let pendingStudents = 0;

    students.forEach(student => {

        if (!Array.isArray(student.fees)) {
            return;
        }

        const hasPending = student.fees.some(
            fee => fee.status === "Pending"
        );

        if (hasPending) {
            pendingStudents++;
        }

    });

    setText(
        "dashboardPendingStudents",
        pendingStudents
    );


    // -------------------------------
    // RECENT STUDENTS
    // -------------------------------

    displayRecentStudents(students);

}


// ===================================
// RECENT STUDENTS
// ===================================

function displayRecentStudents(students) {

    const container =
        document.getElementById("recentStudents");

    if (!container) return;


    if (students.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                No students added yet.
            </div>
        `;

        return;
    }


    const latestStudents =
        [...students].reverse().slice(0, 5);


    container.innerHTML =
        latestStudents.map(student => {

            return `
                <div class="recent-student">

                    <div class="student-avatar">
                        ${getInitials(student.name)}
                    </div>

                    <div class="student-info">

                        <strong>
                            ${escapeHTML(student.name)}
                        </strong>

                        <span>
                            ${escapeHTML(student.course || "No Course")}
                        </span>

                    </div>

                </div>
            `;

        }).join("");

}


// ===================================
// TODAY DATE
// ===================================

function getToday() {

    const today = new Date();

    const year = today.getFullYear();

    const month =
        String(today.getMonth() + 1).padStart(2, "0");

    const day =
        String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ===================================
// MONEY FORMAT
// ===================================

function formatMoney(amount) {

    return "₹" +
        Number(amount).toLocaleString("en-IN");

}


// ===================================
// SET TEXT
// ===================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


// ===================================
// INITIALS
// ===================================

function getInitials(name) {

    if (!name) return "S";

    return name
        .split(" ")
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");

}


// ===================================
// SECURITY
// ===================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}

// ======================================================
// COACHPRO - ATTENDANCE MANAGEMENT
// ======================================================


// ================= GLOBAL DATA =================

let students = JSON.parse(localStorage.getItem("students")) || [];

let attendance =
    JSON.parse(localStorage.getItem("attendance")) || {};

let selectedDate = "";


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    // Today's date
    selectedDate = getTodayDate();

    const attendanceDate =
        document.getElementById("attendanceDate");

    if (attendanceDate) {
        attendanceDate.value = selectedDate;

        attendanceDate.addEventListener("change", function () {

            selectedDate = this.value;

            displayAttendance();
        });
    }


    // Course filter
    const courseFilter =
        document.getElementById("courseFilter");

    if (courseFilter) {

        courseFilter.addEventListener(
            "change",
            displayAttendance
        );
    }


    // Search
    const searchAttendance =
        document.getElementById("searchAttendance");

    if (searchAttendance) {

        searchAttendance.addEventListener(
            "input",
            displayAttendance
        );
    }


    // History date
    const historyDate =
        document.getElementById("historyDate");

    if (historyDate) {

        historyDate.addEventListener(
            "change",
            displayHistory
        );
    }


    // History course
    const historyCourse =
        document.getElementById("historyCourse");

    if (historyCourse) {

        historyCourse.addEventListener(
            "change",
            displayHistory
        );
    }


    // Student report
    const reportStudent =
        document.getElementById("reportStudent");

    if (reportStudent) {

        reportStudent.addEventListener(
            "change",
            function () {

                showStudentReport(this.value);

            }
        );
    }


    // Monthly attendance
    const attendanceMonth =
        document.getElementById("attendanceMonth");

    if (attendanceMonth) {

        attendanceMonth.value =
            getCurrentMonth();

        attendanceMonth.addEventListener(
            "change",
            displayMonthlyAttendance
        );
    }


    // Monthly course
    const monthlyCourse =
        document.getElementById("monthlyCourse");

    if (monthlyCourse) {

        monthlyCourse.addEventListener(
            "change",
            displayMonthlyAttendance
        );
    }


    // Initial loading

    loadReportStudents();

    displayAttendance();

    displayHistory();

    displayMonthlyAttendance();

});



// ======================================================
// DATE FUNCTIONS
// ======================================================

function getTodayDate() {

    const date = new Date();

    return formatDateForInput(date);

}


function getCurrentMonth() {

    const date = new Date();

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;

}


function formatDateForInput(date) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function formatDisplayDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}



// ======================================================
// DAILY ATTENDANCE
// ======================================================

function displayAttendance() {

    students =
        JSON.parse(localStorage.getItem("students")) || [];

    attendance =
        JSON.parse(localStorage.getItem("attendance")) || {};


    const tableBody =
        document.getElementById("attendanceTableBody");

    if (!tableBody) {
        return;
    }


    const filteredStudents =
        getFilteredStudents();


    if (filteredStudents.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-attendance"
                >
                    No students found
                </td>

            </tr>

        `;

        updateSummary([]);

        updateDateText();

        return;

    }


    if (!attendance[selectedDate]) {

        attendance[selectedDate] = {};

    }


    tableBody.innerHTML = "";


    filteredStudents.forEach(function (student, index) {

        const studentId =
            String(student.id);


        const status =
            attendance[selectedDate][studentId] || "";


        const row = document.createElement("tr");


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                <strong>
                    ${escapeHTML(student.name)}
                </strong>
            </td>

            <td>
                ${escapeHTML(student.phone || "-")}
            </td>

            <td>

                <span class="course-badge">

                    ${escapeHTML(student.course || "-")}

                </span>

            </td>

            <td>

                <div class="attendance-buttons">

                    <button
                        class="present-btn ${
                            status === "Present"
                                ? "active"
                                : ""
                        }"
                        onclick="setAttendance('${studentId}', 'Present')"
                    >
                        ✅ Present
                    </button>


                    <button
                        class="absent-btn ${
                            status === "Absent"
                                ? "active"
                                : ""
                        }"
                        onclick="setAttendance('${studentId}', 'Absent')"
                    >
                        ❌ Absent
                    </button>

                </div>

            </td>

        `;


        tableBody.appendChild(row);

    });


    updateSummary(filteredStudents);

    updateDateText();

}



// ======================================================
// FILTER STUDENTS
// ======================================================

function getFilteredStudents() {

    const courseElement =
        document.getElementById("courseFilter");

    const searchElement =
        document.getElementById("searchAttendance");


    const selectedCourse =
        courseElement
            ? courseElement.value
            : "All";


    const searchText =
        searchElement
            ? searchElement.value
                .toLowerCase()
                .trim()
            : "";


    return students.filter(function (student) {

        const courseMatch =
            selectedCourse === "All" ||
            student.course === selectedCourse;


        const searchMatch =
            !searchText ||
            String(student.name || "")
                .toLowerCase()
                .includes(searchText) ||

            String(student.phone || "")
                .toLowerCase()
                .includes(searchText);


        return courseMatch && searchMatch;

    });

}



// ======================================================
// SET ATTENDANCE
// ======================================================

function setAttendance(studentId, status) {

    if (!selectedDate) {

        selectedDate = getTodayDate();

    }


    if (!attendance[selectedDate]) {

        attendance[selectedDate] = {};

    }


    attendance[selectedDate][String(studentId)] =
        status;


    localStorage.setItem(
        "attendance",
        JSON.stringify(attendance)
    );


    displayAttendance();

}



// ======================================================
// SAVE ATTENDANCE
// ======================================================

function saveAttendance() {

    localStorage.setItem(
        "attendance",
        JSON.stringify(attendance)
    );


    alert(
        `Attendance saved for ${formatDisplayDate(selectedDate)}`
    );


    displayHistory();

    displayMonthlyAttendance();

}



// ======================================================
// DAILY SUMMARY
// ======================================================

function updateSummary(filteredStudents) {

    const total =
        filteredStudents.length;


    let present = 0;

    let absent = 0;


    filteredStudents.forEach(function (student) {

        const status =
            attendance[selectedDate]
                ? attendance[selectedDate][String(student.id)]
                : "";


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
            ? Math.round((present / marked) * 100)
            : 0;


    setText("totalStudents", total);

    setText("presentCount", present);

    setText("absentCount", absent);

    setText(
        "attendancePercentage",
        percentage + "%"
    );

}



// ======================================================
// DATE TEXT
// ======================================================

function updateDateText() {

    const element =
        document.getElementById("selectedDateText");


    if (!element) {
        return;
    }


    if (!selectedDate) {

        element.textContent =
            "Select a date";

        return;

    }


    element.textContent =
        formatDisplayDate(selectedDate);

}



// ======================================================
// ATTENDANCE HISTORY
// ======================================================

function displayHistory() {

    const tableBody =
        document.getElementById("historyTableBody");


    if (!tableBody) {
        return;
    }


    const dateElement =
        document.getElementById("historyDate");


    const courseElement =
        document.getElementById("historyCourse");


    let date =
        dateElement
            ? dateElement.value
            : "";


    const course =
        courseElement
            ? courseElement.value
            : "All";


    if (!date) {

        date = selectedDate;

        if (dateElement) {
            dateElement.value = date;
        }

    }


    const records =
        attendance[date] || {};


    let filteredStudents =
        students.filter(function (student) {

            return course === "All" ||
                student.course === course;

        });


    if (filteredStudents.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    class="empty-attendance"
                >
                    No students found
                </td>

            </tr>

        `;

        updateHistorySummary([]);

        return;

    }


    tableBody.innerHTML = "";


    filteredStudents.forEach(function (student) {

        const status =
            records[String(student.id)];


        const row =
            document.createElement("tr");


        let statusHTML = `

            <span class="history-pending">
                Not Marked
            </span>

        `;


        if (status === "Present") {

            statusHTML = `

                <span class="history-present">
                    ✅ Present
                </span>

            `;

        }


        if (status === "Absent") {

            statusHTML = `

                <span class="history-absent">
                    ❌ Absent
                </span>

            `;

        }


        row.innerHTML = `

            <td>

                <strong>
                    ${escapeHTML(student.name)}
                </strong>

            </td>

            <td>

                <span class="course-badge">
                    ${escapeHTML(student.course || "-")}
                </span>

            </td>

            <td>
                ${statusHTML}
            </td>

        `;


        tableBody.appendChild(row);

    });


    updateHistorySummary(filteredStudents);

}



// ======================================================
// HISTORY SUMMARY
// ======================================================

function updateHistorySummary(filteredStudents) {

    const dateElement =
        document.getElementById("historyDate");


    const date =
        dateElement
            ? dateElement.value
            : selectedDate;


    const records =
        attendance[date] || {};


    let present = 0;

    let absent = 0;


    filteredStudents.forEach(function (student) {

        const status =
            records[String(student.id)];


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
            ? Math.round((present / marked) * 100)
            : 0;


    setText(
        "historyStudents",
        filteredStudents.length
    );


    setText(
        "historyPresent",
        present
    );


    setText(
        "historyAbsent",
        absent
    );


    setText(
        "historyPercentage",
        percentage + "%"
    );

}



// ======================================================
// STUDENT REPORT DROPDOWN
// ======================================================

function loadReportStudents() {

    const select =
        document.getElementById("reportStudent");


    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">
            Select Student
        </option>

    `;


    students.forEach(function (student) {

        const option =
            document.createElement("option");


        option.value =
            student.id;


        option.textContent =
            `${student.name} - ${student.course}`;


        select.appendChild(option);

    });

}



// ======================================================
// STUDENT-WISE REPORT
// ======================================================

function showStudentReport(studentId) {

    const tableBody =
        document.getElementById("reportTableBody");


    if (!tableBody) {
        return;
    }


    if (!studentId) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty-attendance"
                >
                    Select a student
                </td>

            </tr>

        `;


        setText("reportTotalClasses", 0);

        setText("reportPresent", 0);

        setText("reportAbsent", 0);

        setText("reportPercentage", "0%");

        return;

    }


    const student =
        students.find(function (item) {

            return String(item.id) ===
                String(studentId);

        });


    if (!student) {
        return;
    }


    let totalClasses = 0;

    let present = 0;

    let absent = 0;


    let reportRows = [];


    Object.keys(attendance)
        .sort()
        .reverse()
        .forEach(function (date) {

            const status =
                attendance[date]
                    ? attendance[date][String(studentId)]
                    : "";


            if (!status) {
                return;
            }


            totalClasses++;


            if (status === "Present") {
                present++;
            }


            if (status === "Absent") {
                absent++;
            }


            reportRows.push({

                date: date,

                status: status

            });

        });


    tableBody.innerHTML = "";


    if (reportRows.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty-attendance"
                >
                    No attendance record found
                </td>

            </tr>

        `;

    }


    reportRows.forEach(function (record) {

        const row =
            document.createElement("tr");


        const statusHTML =
            record.status === "Present"

                ? `<span class="history-present">
                    ✅ Present
                   </span>`

                : `<span class="history-absent">
                    ❌ Absent
                   </span>`;


        row.innerHTML = `

            <td>
                ${formatDisplayDate(record.date)}
            </td>

            <td>
                ${escapeHTML(student.name)}
            </td>

            <td>

                <span class="course-badge">
                    ${escapeHTML(student.course || "-")}
                </span>

            </td>

            <td>
                ${statusHTML}
            </td>

        `;


        tableBody.appendChild(row);

    });


    const percentage =
        totalClasses > 0
            ? Math.round(
                (present / totalClasses) * 100
            )
            : 0;


    setText(
        "reportTotalClasses",
        totalClasses
    );


    setText(
        "reportPresent",
        present
    );


    setText(
        "reportAbsent",
        absent
    );


    setText(
        "reportPercentage",
        percentage + "%"
    );

}



// ======================================================
// MONTHLY ATTENDANCE
// ======================================================

function displayMonthlyAttendance() {

    const tableBody =
        document.getElementById("monthlyTableBody");


    if (!tableBody) {
        return;
    }


    const monthElement =
        document.getElementById("attendanceMonth");


    const courseElement =
        document.getElementById("monthlyCourse");


    const month =
        monthElement
            ? monthElement.value
            : getCurrentMonth();


    const selectedCourse =
        courseElement
            ? courseElement.value
            : "All";


    if (!month) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-attendance"
                >
                    Select a month
                </td>

            </tr>

        `;

        return;

    }


    const filteredStudents =
        students.filter(function (student) {

            return selectedCourse === "All" ||
                student.course === selectedCourse;

        });


    let monthlyPresent = 0;

    let monthlyAbsent = 0;

    let monthlyClasses = 0;


    tableBody.innerHTML = "";


    if (filteredStudents.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-attendance"
                >
                    No students found
                </td>

            </tr>

        `;

        updateMonthlySummary(
            0,
            0,
            0,
            0
        );

        return;

    }


    filteredStudents.forEach(function (student) {

        let present = 0;

        let absent = 0;


        Object.keys(attendance)
            .forEach(function (date) {

                if (!date.startsWith(month)) {
                    return;
                }


                const status =
                    attendance[date]
                        ? attendance[date][String(student.id)]
                        : "";


                if (status === "Present") {

                    present++;

                }


                if (status === "Absent") {

                    absent++;

                }

            });


        const totalClasses =
            present + absent;


        monthlyPresent += present;

        monthlyAbsent += absent;

        monthlyClasses += totalClasses;


        const percentage =
            totalClasses > 0
                ? Math.round(
                    (present / totalClasses) * 100
                )
                : 0;


        let percentageClass = "";


        if (percentage >= 75) {

            percentageClass = "good";

        }
        else if (
            totalClasses > 0 &&
            percentage < 50
        ) {

            percentageClass = "low";

        }


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                <strong>
                    ${escapeHTML(student.name)}
                </strong>

            </td>

            <td>

                <span class="course-badge">
                    ${escapeHTML(student.course || "-")}
                </span>

            </td>

            <td>
                ${totalClasses}
            </td>

            <td>
                <strong class="monthly-present-text">
                    ${present}
                </strong>
            </td>

            <td>
                <strong class="monthly-absent-text">
                    ${absent}
                </strong>
            </td>

            <td>

                <span class="
                    monthly-percentage
                    ${percentageClass}
                ">
                    ${percentage}%
                </span>

            </td>

        `;


        tableBody.appendChild(row);

    });


    updateMonthlySummary(

        filteredStudents.length,

        monthlyClasses,

        monthlyPresent,

        monthlyAbsent

    );

}



// ======================================================
// MONTHLY SUMMARY
// ======================================================

function updateMonthlySummary(
    studentsCount,
    classes,
    present,
    absent
) {

    setText(
        "monthlyStudents",
        studentsCount
    );


    setText(
        "monthlyClasses",
        classes
    );


    setText(
        "monthlyPresent",
        present
    );


    setText(
        "monthlyAbsent",
        absent
    );

}



// ======================================================
// UTILITY
// ======================================================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent = value;

    }

}



// ======================================================
// HTML SECURITY
// ======================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}
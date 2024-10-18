const http = axios.create({
    baseURL: "http://localhost:3000",
    timeout: 30000,
    headers: { "X-Custom-Header": "foobar" },
});

let currentPage = 1; // Track the current page
const limit = 4; // Number of students per page

// Function to fetch all students with pagination
async function getAllStudentsPagination(page) {
    try {
        const res = await http.get(
            `/students-paging?page=${page}&limit=${limit}`
        );
        return res.data; // Return the fetched data
    } catch (error) {
        console.error(error);
        return { students: [], totalPages: 0 }; // Return empty array in case of error
    }
}

// Function to render student data
async function renderStudent() {
    const { students, totalPages } = await getAllStudentsPagination(
        currentPage
    );

    console.log(students);

    let content = "";
    for (let sv of students) {
        let { _id, name, avatar, age, address } = sv;
        content += `
            <tr>
                <td>${name}</td>
                <td><img src="http://localhost:3000/${avatar}" alt="Avatar" width="50"/></td>
                <td>${age}</td>
                <td>${address}</td>
                <td>
                    <button class="btn btn-warning" onclick="editStudent('${_id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteStudent('${_id}')">Delete</button>
                </td>
            </tr>
        `;
    }
    document.getElementById("tbodySinhVien").innerHTML = content;
    // Render pagination controls
    renderPagination(totalPages);
}

// Function to render pagination controls
function renderPagination(totalPages) {
    let paginationContent = "";
    for (let i = 1; i <= totalPages; i++) {
        paginationContent += `
            <button class="btn ${
                i === currentPage ? "btn-primary" : "btn-secondary"
            }" onclick="changePage(${i})">${i}</button>
        `;
    }
    document.getElementById("pagination").innerHTML = paginationContent; // Assuming you have a div with id="pagination"
}

// Function to change the page
function changePage(page) {
    currentPage = page;
    renderStudent(); // Re-render the student list for the new page
}

// Initial render of student data
renderStudent();

let formQLSV = document.getElementById("formQLSV");
// Add student
formQLSV.onsubmit = async function (event) {
    event.preventDefault();
    let name = document.getElementById("txtTenSV").value;
    let age = document.getElementById("txtTuoi").value * 1;
    let address = document.getElementById("txtDiaChi").value;
    let avatar = document.getElementById("fileAvatar").files[0];

    let formData = new FormData();
    formData.append("name", name);
    formData.append("age", age);
    formData.append("address", address);
    formData.append("avatar", avatar);

    try {
        const res = await http.post("/students", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        console.log(res.data);

        // Reset the current page to 1 and re-render
        currentPage = 1;
        renderStudent();
        formQLSV.reset();
    } catch (error) {
        console.error(
            "Error adding student:",
            error.response ? error.response.data : error.message
        );
    }
};

// Function to edit a student
async function editStudent(id) {
    const student = await http.get(`/students/${id}`);
    const { name, age, address, avatar } = student.data;

    document.getElementById("txtTenSV").value = name;
    document.getElementById("txtTuoi").value = age;
    document.getElementById("txtDiaChi").value = address;

    // Store the ID in a hidden input or variable for the update operation
    document.getElementById("hiddenStudentId").value = id;
}

// Function to update a student
document.getElementById("btnCapNhat").onclick = async function () {
    const id = document.getElementById("hiddenStudentId").value; // Get the ID of the student to update
    let name = document.getElementById("txtTenSV").value;
    let age = document.getElementById("txtTuoi").value * 1;
    let address = document.getElementById("txtDiaChi").value;
    let avatar = document.getElementById("fileAvatar").files[0];

    let formData = new FormData();
    formData.append("name", name);
    formData.append("age", age);
    formData.append("address", address);
    formData.append("avatar", avatar);

    try {
        const res = await http.put(`/students/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        console.log(res.data);

        renderStudent();
        document.getElementById("formQLSV").reset(); // Reset the form
    } catch (error) {
        console.error(
            "Error updating student:",
            error.response ? error.response.data : error.message
        );
    }
};

// Function to delete a student
async function deleteStudent(id) {
    if (confirm("Are you sure you want to delete this student?")) {
        try {
            const res = await http.delete(`/students/${id}`);
            console.log(res.data);
            renderStudent(); // Refresh the student list
        } catch (error) {
            console.error(
                "Error deleting student:",
                error.response ? error.response.data : error.message
            );
        }
    }
}

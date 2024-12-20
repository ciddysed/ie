import React, { useEffect, useState } from 'react';

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    color: '#2c3e50',
  },
  form: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    marginRight: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    flex: '1',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  courseList: {
    listStyleType: 'none',
    paddingLeft: '0',
  },
  courseItem: {
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseName: {
    fontWeight: 'bold',
  },
  courseActions: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    padding: '5px 10px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
};

const TutorCourse = () => {
  const [courses, setCourses] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [username, setUsername] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [newCourseName, setNewCourseName] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUsername(userData.username);
      fetchCourses(userData.username);
    }
  }, []);

  const fetchCourses = async (username) => {
    try {
      const response = await fetch(`http://localhost:8080/Course/tutors/${username}/courses`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setCourses(data);
      } else {
        console.error('Fetched data is not an array:', data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleAddCourse = async () => {
    try {
      const response = await fetch(`http://localhost:8080/Course/tutors/${username}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseName }),
      });
      if (response.ok) {
        fetchCourses(username);
        setCourseName('');
      } else {
        const errorData = await response.json();
        console.error('Error adding course:', errorData);
      }
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const openEditModal = (course) => {
    setCurrentCourse(course);
    setNewCourseName(course.courseName);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentCourse(null);
    setNewCourseName('');
  };

  const handleEditCourse = async () => {
    if (currentCourse && newCourseName) {
      try {
        const response = await fetch(`http://localhost:8080/Course/tutors/${username}/courses/${currentCourse.courseID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseName: newCourseName }),
        });
        if (response.ok) {
          fetchCourses(username);
          closeEditModal();
        } else {
          const errorData = await response.json();
          console.error('Error editing course:', errorData);
        }
      } catch (error) {
        console.error('Error editing course:', error);
      }
    }
  };

  const openDeleteModal = (course) => {
    setCurrentCourse(course);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentCourse(null);
  };

  const handleDeleteCourse = async () => {
    if (currentCourse) {
      try {
        const response = await fetch(`http://localhost:8080/Course/tutors/${username}/courses/${currentCourse.courseID}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchCourses(username);
          closeDeleteModal();
        } else {
          const errorData = await response.json();
          console.error('Error deleting course:', errorData);
        }
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Manage Your Courses</h1>
      <div style={styles.form}>
        <input
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="Course Name"
          style={styles.input}
        />
        <button onClick={handleAddCourse} style={styles.button}>
          Add Course
        </button>
      </div>
      <h3 style={styles.header}>Your Courses</h3>
      <ul style={styles.courseList}>
        {Array.isArray(courses) && courses.map((course) => (
          <li key={course.courseID} style={styles.courseItem}>
            <span style={styles.courseName}>{course.courseName}</span>
            <div style={styles.courseActions}>
              <button onClick={() => openEditModal(course)} style={styles.editButton}>
                Edit
              </button>
              <button onClick={() => openDeleteModal(course)} style={styles.deleteButton}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {isEditModalOpen && (
        <>
          <div style={styles.overlay} onClick={closeEditModal}></div>
          <div style={styles.modal}>
            <h2>Edit Course</h2>
            <input
              type="text"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleEditCourse} style={styles.button}>
              Save
            </button>
            <button onClick={closeEditModal} style={{ ...styles.button, backgroundColor: 'gray' }}>
              Cancel
            </button>
          </div>
        </>
      )}

      {isDeleteModalOpen && (
        <>
          <div style={styles.overlay} onClick={closeDeleteModal}></div>
          <div style={styles.modal}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete the course "{currentCourse?.courseName}"?</p>
            <button onClick={handleDeleteCourse} style={styles.deleteButton}>
              Delete
            </button>
            <button onClick={closeDeleteModal} style={{ ...styles.button, backgroundColor: 'gray' }}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TutorCourse;
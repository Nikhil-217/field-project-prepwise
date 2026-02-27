const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json();
    return { status: res.status, data };
}

async function runTests() {
    console.log('--- Starting API Tests ---');
    let teacherToken, studentToken, quizId;

    // 1. Register Teacher
    console.log('\n1. Registering Teacher...');
    const teacherRes = await request('/auth/register/teacher', 'POST', {
        role: 'teacher',
        name: 'Test Teacher',
        email: `teacher_${Date.now()}@test.com`,
        password: 'password123',
        employeeId: `T${Date.now()}`,
        employeeName: 'Test Teacher',
        subjectDealing: 'Testing',
        section: 'A'
    });
    console.log(teacherRes.status === 201 ? 'SUCCESS' : 'FAILED', teacherRes.data);
    teacherToken = teacherRes.data.token;

    // 2. Register Student
    console.log('\n2. Registering Student...');
    const studentRes = await request('/auth/register/student', 'POST', {
        role: 'student',
        name: 'Test Student',
        email: `student_${Date.now()}@test.com`,
        password: 'password123',
        rollNo: `S${Date.now()}`,
        year: 2,
        regulation: 'R22',
        semester: 1,
        section: 'A'
    });
    console.log(studentRes.status === 201 ? 'SUCCESS' : 'FAILED', studentRes.data);
    studentToken = studentRes.data.token;

    // 3. Create Quiz (Teacher)
    console.log('\n3. Creating Quiz...');
    const createQuizRes = await request('/quizzes', 'POST', {
        title: 'Test API Quiz',
        subject: 'Testing',
        regulation: 'R22',
        year: 2,
        semester: 1,
        questions: [
            { type: 'MCQ', text: '1 + 1 = ?', options: ['1', '2', '3'], correctAnswer: '2', points: 1 }
        ]
    }, teacherToken);
    console.log(createQuizRes.status === 201 ? 'SUCCESS' : 'FAILED', createQuizRes.data);
    quizId = createQuizRes.data?.data?._id;

    // 4. Get Quizzes (Student)
    console.log('\n4. Getting Quizzes as Student...');
    const getQuizzesRes = await request('/quizzes', 'GET', null, studentToken);
    console.log(getQuizzesRes.status === 200 ? 'SUCCESS' : 'FAILED', `Available quizzes: ${getQuizzesRes.data?.count}`);

    // 5. Submit Quiz (Student)
    if (quizId) {
        console.log('\n5. Submitting Quiz as Student...');
        const questionId = createQuizRes.data.data.questions[0]._id;
        const submitRes = await request(`/quizzes/${quizId}/submit`, 'POST', {
            answers: [{ questionId, answer: '2' }]
        }, studentToken);
        console.log(submitRes.status === 201 ? 'SUCCESS' : 'FAILED', submitRes.data);
    }

    // 6. Get Quiz Results (Teacher)
    if (quizId) {
        console.log('\n6. Getting Quiz Results as Teacher...');
        const resultsRes = await request(`/quizzes/${quizId}`, 'GET', null, teacherToken);
        console.log(resultsRes.status === 200 ? 'SUCCESS' : 'FAILED', `Submissions: ${resultsRes.data?.data?.submissions?.length || 0}`);
    }

    console.log('\n--- Tests Complete ---');
}

runTests().catch(console.error);

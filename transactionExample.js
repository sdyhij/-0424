const pool = require('./db');

async function doTransaction() {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction(); // 開始交易

        const studentId = 'S10721001';
        const newDeptId = 'EE001';

        // 1. 先檢查學生是否存在
        const checkStudent = 'SELECT * FROM STUDENT WHERE Student_ID = ?';
        const [student] = await conn.query(checkStudent, [studentId]);
        
        if (!student) {
            throw new Error(`學號 ${studentId} 不存在，無法更新系所`);
        }

        console.log(`找到學生: ${studentId}, 當前系所: ${student.Department_ID}`);

        // 2. 更新學生系所
        const updateStudent = 'UPDATE STUDENT SET Department_ID = ? WHERE Student_ID = ?';
        await conn.query(updateStudent, [newDeptId, studentId]);

        // 3. 查詢更新後的結果
        const verifyUpdate = 'SELECT Department_ID FROM STUDENT WHERE Student_ID = ?';
        const [updatedStudent] = await conn.query(verifyUpdate, [studentId]);

        console.log(`更新成功，學生 ${studentId} 的新系所為: ${updatedStudent.Department_ID}`);

        await conn.commit(); // 提交交易
        console.log('交易成功，已提交');
    } catch (err) {
        if (conn) await conn.rollback(); // 發生錯誤則回滾
        console.error('交易失敗，已回滾：', err);
    } finally {
        if (conn) conn.release(); // 釋放連線
    }
}

// 執行交易
doTransaction();
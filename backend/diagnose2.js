import pool from './src/db/connection.js';

async function fullDiagnosis() {
  try {
    console.log('\n========================================');
    console.log('MILESTONE SYSTEM FULL DIAGNOSIS');
    console.log('========================================\n');

    // 1. Count all milestones and show last 10 by ID
    const [total] = await pool.query('SELECT COUNT(*) as count, MAX(Milestone_id) as maxId FROM Milestone');
    console.log(`Total milestones in DB: ${total[0].count}, highest ID: ${total[0].maxId}\n`);

    // 2. Show milestones for Request #16 specifically
    const [req16] = await pool.query(
      'SELECT * FROM Milestone WHERE Request_id = 16'
    );
    console.log(`=== Milestones for Request_id=16: ${req16.length} row(s) ===`);
    if (req16.length) console.table(req16);

    // 3. Show ALL distinct Request_ids that have milestones
    const [reqIds] = await pool.query(
      'SELECT Request_id, COUNT(*) as milestoneCount, MAX(Milestone_id) as lastId FROM Milestone GROUP BY Request_id ORDER BY Request_id'
    );
    console.log('\n=== Requests that HAVE milestones in DB ===');
    console.table(reqIds);

    // 4. Check Application for Request #16
    const [app16] = await pool.query(
      'SELECT Application_id, Request_id, Artisan_id, Status FROM Application WHERE Request_id = 16'
    );
    console.log('\n=== Applications for Request_id=16 ===');
    console.table(app16.length ? app16 : [{ result: 'NO APPLICATIONS FOUND for Request_id=16' }]);

    // 5. Check last 5 milestones inserted (highest IDs)
    const [last5] = await pool.query(
      'SELECT Milestone_id, Request_id, Artisan_id, Application_id, Title, Status FROM Milestone ORDER BY Milestone_id DESC LIMIT 5'
    );
    console.log('\n=== Last 5 milestones inserted (highest IDs) ===');
    console.table(last5);

    // 6. Check Milestone table columns (confirm Application_id exists)
    const [cols] = await pool.query(
      "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='CURIO' AND TABLE_NAME='Milestone' ORDER BY ORDINAL_POSITION"
    );
    console.log('\n=== Milestone table columns ===');
    console.table(cols);

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
}

fullDiagnosis();

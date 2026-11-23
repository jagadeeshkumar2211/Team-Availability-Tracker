const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./team.db", (err) => {
    if (err) {
        console.error("SQLite connection failed:", err.message);
    } else {
        console.log("SQLite database connected");
    }
});


// =====================================================
// CREATE TABLES
// =====================================================

db.serialize(() => {

    // -------------------------------------------------
    // TEAM MEMBERS
    // -------------------------------------------------

    db.run(`
        CREATE TABLE IF NOT EXISTS team_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            department TEXT NOT NULL,
            email TEXT,
            status TEXT DEFAULT 'Available',
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,

            CHECK(status IN ('Available', 'Busy', 'Away'))
        )
    `);


    // -------------------------------------------------
    // STATUS HISTORY
    // -------------------------------------------------

    db.run(`
        CREATE TABLE IF NOT EXISTS status_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            old_status TEXT,
            new_status TEXT NOT NULL,
            changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY(member_id)
            REFERENCES team_members(id)
            ON DELETE CASCADE
        )
    `);


    // -------------------------------------------------
    // HELP REQUESTS
    // -------------------------------------------------

    db.run(`
        CREATE TABLE IF NOT EXISTS help_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            requested_by TEXT NOT NULL,
            priority TEXT DEFAULT 'Normal',
            status TEXT DEFAULT 'Open',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            CHECK(priority IN ('Low', 'Normal', 'High')),
            CHECK(status IN ('Open', 'Accepted', 'Resolved'))
        )
    `);


    // -------------------------------------------------
    // INSERT SAMPLE MEMBERS ONLY IF EMPTY
    // -------------------------------------------------

    db.get(
        `SELECT COUNT(*) AS count FROM team_members`,
        [],
        (err, row) => {

            if (err) {
                console.error(err.message);
                return;
            }

            if (row.count === 0) {

                const members = [

                    [
                        "Rashmita Rane",
                        "Frontend Developer",
                        "Engineering",
                        "rashmita@example.com",
                        "Available"
                    ],

                    [
                        "Rahul Sharma",
                        "Backend Developer",
                        "Engineering",
                        "rahul@example.com",
                        "Busy"
                    ],

                    [
                        "Priya Patil",
                        "UI/UX Designer",
                        "Design",
                        "priya@example.com",
                        "Away"
                    ],

                    [
                        "Sneha Kulkarni",
                        "QA Tester",
                        "Testing",
                        "sneha@example.com",
                        "Available"
                    ],

                    [
                        "Amit Joshi",
                        "Database Developer",
                        "Engineering",
                        "amit@example.com",
                        "Busy"
                    ],

                    [
                        "Anjali Desai",
                        "Project Manager",
                        "Management",
                        "anjali@example.com",
                        "Available"
                    ]

                ];


                const statement = db.prepare(`
                    INSERT INTO team_members
                    (
                        name,
                        role,
                        department,
                        email,
                        status
                    )
                    VALUES (?, ?, ?, ?, ?)
                `);


                members.forEach(member => {

                    statement.run(member);

                });


                statement.finalize(() => {

                    console.log(
                        "Sample team members inserted"
                    );

                });

            }

        }
    );

});


module.exports = db;
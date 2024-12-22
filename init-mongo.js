db = db.getSiblingDB('Adder'); // Wechsle zur Datenbank 'Adder'

db.createUser({
    user: "user",
    pwd: "pass",
    roles: [{ role: "readWrite", db: "Adder" }]
});

print("Database and user initialization complete!");
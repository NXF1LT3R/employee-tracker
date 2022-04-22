//const db = require('./db/connection');
const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const { query } = require('./db/connection');
//const apiRoutes = require('./routes/apiRoutes');

// Use apiRoutes
//app.use('/api', apiRoutes);

// Start server after DB connection
async function runServer() {
const db = await mysql.createConnection({
    host: 'localhost',
    // Your MySQL username,
    user: 'root',
    // Your MySQL password
    password: 'M@rch8th',
    database: 'employees'
});

db.connect(err => {
  if (err) throw err;
  console.log('Database connected.');
  /* app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  }); */
});

const promptUser = async () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: "What would you like to do?",
            choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', 'update an employee role']
        }, {
            type: 'input',
            name: 'departmentName',
            message: "What department would you like to create?",
            when: answers => {
                return answers.choice == 'add a department'
            }
        },
        {
            type: 'input',
            name: 'title',
            message: "What is the role you would like to create",
            when: answers => {
                return answers.choice == 'add a role'
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: "What is the salary for this role?",
            when: answers => {
                return answers.choice == 'add a role'
            }
        },
        {
            type: 'input',
            name: 'departmentID',
            message: "What department does this role belong to?",
            when: answers => {
                return answers.choice == 'add a role'
            }
        },
        {
            type: 'input',
            name: 'firstName',
            message: "What is the employee's first name?",
            when: answers => {
                return answers.choice == 'add an employee'
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: "What is the employee's last name?",
            when: answers => {
                return answers.choice == 'add an employee'
            }
        },
        {
            type: 'input',
            name: 'roleID',
            message: "What is the employee's position (roleID)?",
            when: answers => {
                return answers.choice == 'add an employee'
            }
        },
        {
            type: 'confirm',
            name: 'hasManager',
            message: "Does this employee have a manager?",
            when: answers => {
                return answers.choice == 'add an employee'
            }
        },
        {
            type: 'input',
            name: 'managerID',
            message: "What is the ID of the employee's manager?",
            when: answers => {
                return answers.choice == 'add an employee' && answers.hasManager == true
            }
        },
        {
            type: 'list',
            name: 'newRoleID',
            message: "What is the employee's new role?",
            choices: answers => {
                return getAllRoles()
            },
            when: answers => {
                return answers.choice == 'update an employee role'}
        },
        {
            type: 'list',
            name: 'employee2update',
            message: "Choose and employee to update",
            choices: answers => {
                return getAllEmployees()
            }, 
            when: answers => {
                return answers.choice == 'update an employee role'}
        },
        {
            type: 'confirm',
            name: 'confirmContinue',
            message: 'Do you have another query?',
            default: false
          }
    ]).then(async (choices) => {
        if (choices.choice == 'add a department') {
            // query = 'INSERT INTO departments (`name`) VALUES ('
            db.query('INSERT INTO departments (`name`) VALUES (?);', [choices.departmentName])
        } else if(choices.choice == 'view all departments') {
            const [rows, fields] = await db.execute('SELECT * FROM departments')
            let results = "id\tname\n"
            for (let i = 0; i < rows.length; i ++) {
                results = results + rows[i].id + "\t"
                results = results + rows[i].name + "\t"
                results = results + "\n"
            }
            console.log(results)
        } else if (choices.choice == 'add a role') {
            db.query('INSERT INTO role (`title`, `salary`, `department_id`) VALUES (?, ?, ?);', [choices.title, choices.salary, choices.departmentID])
        } else if (choices.choice == 'add an employee') {
            let managerID = null
            if (choices.hasManager) {
                managerID = choices.managerID
            }
            db.query('INSERT INTO employees (`first_name`, `last_name`, `role_id`, `manager_id`) VALUES (?,?,?,?);', [choices.firstName, choices.lastName, choices.roleID, managerID])
        } else if (choices.choice == 'view all roles') {
            const [rows, fields] = await db.execute('SELECT * FROM role JOIN departments on role.department_id = departments.id;')
            let results = "id\ttitle\tsalary\tdepartment_name\n"
            for (let i = 0; i < rows.length; i ++) {
                results += rows[i].id+ "\t"
                results += rows[i].title+ "\t"
                results += rows[i].salary+ "\t"
                results += rows[i].name+ "\n"
            }
            console.log(results)
        } else if (choices.choice == 'view all employees') {
            const [rows, fields] = await db.execute(`SELECT emp.id, emp.first_name, emp.last_name, role.title, role.salary, departments.name as department_name,
            mang.id as managerID, mang.first_name as manager_first_name, mang.last_name as manager_last_name 
            FROM employees emp
            JOIN 
            role 
            on emp.role_id = role.id 
            JOIN 
            departments 
            on role.department_id = departments.id
            LEFT JOIN
            employees mang
            on mang.id = emp.manager_id
            ;`)
            let results = padWord("id")+padWord("first_name")+padWord("last_name")+padWord("title")+padWord("salary")+padWord("department_name")+padWord("managerID")+padWord("manager_first_name")+padWord("manager_last_name")+"\n"
            for (let i = 0; i < rows.length; i ++) {
                results += padWord(rows[i].id)+ padWord(rows[i].first_name)+ padWord(rows[i].last_name)+ padWord(rows[i].title)+ padWord(rows[i].salary)+ padWord(rows[i].department_name)+ padWord(rows[i].managerID)+ padWord(rows[i].manager_first_name)+ padWord(rows[i].manager_last_name)+ "\n"
            }
            console.log(results)
        }
        else if (choices.choice == 'update an employee role') {
            let employeeID = choices.employee2update.split(" ")[0]
            console.log("employee id is"+employeeID)
            let roleID = choices.newRoleID.split(" ")[0]
            console.log("new role id is"+roleID)
            db.query('UPDATE employees SET role_id = ? where id = ?;', [roleID, employeeID])
        }
        if (choices.confirmContinue) {
            await promptUser()
        }
    });
};

function padWord(word) {
    return (""+ word).padEnd(21)
}

async function getAllEmployees() {
    const [rows, fields] = await db.execute(`SELECT emp.id, emp.first_name, emp.last_name, role.title, role.salary, departments.name as department_name,
            mang.id as managerID, mang.first_name as manager_first_name, mang.last_name as manager_last_name 
            FROM employees emp
            JOIN 
            role 
            on emp.role_id = role.id 
            JOIN 
            departments 
            on role.department_id = departments.id
            LEFT JOIN
            employees mang
            on mang.id = emp.manager_id
            ;`)
            let employees = []
            for (let i = 0; i < rows.length; i ++) {
                employees.push(rows[i].id + " " + rows[i].first_name + " " + rows[i].last_name)
            }
            return employees
}

async function getAllRoles() {
    const [rows, fields] = await db.execute('SELECT * FROM role;')
        let roles = []
        for (let i = 0; i < rows.length; i ++) {
            roles.push(rows[i].id + " " + rows[i].title)
        }
        return roles
}

promptUser()}

runServer();
//Required dependencies
const db = require('./config/connection.js');
const inquirer = require('inquirer');
const connection = require('./config/connection.js');


function initialize() {

  promptUser();
}

//Function to ask user what task they would like to do
function promptUser() {
  inquirer.prompt([{
    type: 'list',
    name: 'task',
    message: 'What would you like to do?',
    choices: ['View All Departments',
      'View All Roles',
      'View All Employees',
      'Add a Department',
      'Add a Role',
      'Add an Employee',
      "Update an Employee's Role",
      "Quit"
    ]
  }]).then(function (data) {
    switch (data.task) {
      case "View All Departments":
        viewDepartments();
        break;
      case "View All Roles":
        viewRoles();
        break;
      case "View All Employees":
        viewEmployees();
        break;
      case "Add a Department":
        createDepartment();
        break;
      case "Add a Role":
        createRole();
        break;
      case "Add an Employee":
        createEmployee();
        break;
      case "Update an Employee's Role":
        updateEmployeeRole();
        break;
      case "Quit":
        connection.end();
        break;
    }
  });
};

//Function to display all departments -> user is presented with a formatted table with department names & IDs
function viewDepartments() {

  //MySQL call to view department ID and name
  const sql = `SELECT department.id, department.name AS department FROM department`
  db.query(sql, (err, results) => {
    if (err) throw err;

    const transformed = results.reduce((acc, {
      id,
      ...x
    }) => {
      acc[id] = x;
      return acc
    }, {});
    console.table(transformed);
    promptUser();
  })
}

//Function to display all roles
function viewRoles() {

  const sql = `SELECT role.id, role.title, department.name AS department, role.salary
                FROM role JOIN department ON role.department_id = department.id`
  db.query(sql, (err, result) => {
    if (err) throw err;

    const transformed = result.reduce((acc, {
      id,
      ...i
    }) => {
      acc[id] = i;
      return acc
    }, {});
    console.table(transformed);
    promptUser();
  })
}

//Function to display all employees
function viewEmployees() {

  const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title,
                        department.name AS department, role.salary, manager.last_name AS manager
                FROM employee
                JOIN role ON employee.role_id = role.id
                JOIN department ON role.department_id = department.id
                LEFT JOIN employee manager ON employee.manager_id = manager.id;`

  db.query(sql, (err, results) => {
    if (err) throw err;

    const transformed = results.reduce((acc, {
      id,
      ...x
    }) => {
      acc[id] = x;
      return acc
    }, {});
    console.table(transformed);
    promptUser();
  })
}

//Function to add a department
function createDepartment() {
  inquirer.prompt([{
    type: 'input',
    name: 'department',
    message: 'What department would you like to add?',
    validate: input => {
      if (input && input.length <= 30) {
        return true;
      } else {
        return false;
      }
    }
  }]).then(function (data) {

    db.query(`INSERT INTO department (name) VALUES ('${data.department}')`, (err) => {
      if (err) throw err;

      promptUser();
    });
  });
}

function createRole() {

  //call to get departments
  db.query(`Select department.name FROM department`, (err, results) => {
    if (err) throw err;

    let departmentArray = [];

    //print departments into an array
    for (let i = 0; i < results.length; i++) {
      departmentArray.push(results[i].name)
    }

    inquirer.prompt([{
      type: 'input',
      name: 'role',
      message: 'Would you like to add a role?',
      validate: input => {
        if (input && input.length <= 30) {
          return true;
        } else {
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'salary',
      message: 'What would this position pay?',
      validate: input => {
        if (isNaN(input)) {
          return false;
        } else {
          return true;
        }
      }
    },
    {
      type: 'list',
      name: 'department',
      message: 'Which department does this job belong to?',
      choices: departmentArray
    }
    ]).then(function (data) {

      //call to ID from departments
      db.query(`SELECT * FROM department WHERE  name = '${data.department}'`, (err, results) => {
        if (err) throw err;

        //call to add role, title, salary, and department ID)
        db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${data.role}', '${data.salary}', '${results[0].id}')`, (err) => {
          if (err) throw err;

          promptUser();
        });
      });
    });
  });
}

//Function to add an employee
function createEmployee() {

  //MySQL call to get roles list
  db.query(`SELECT role.title FROM role`, (err, data1) => {
    if (err) throw err;

    let roleArray = [];

    //For loop to insert roles into an array
    for (let i = 0; i < data1.length; i++) {
      roleArray.push(data1[i].title)
    }

    //MySQL call to get an employee list to select manager
    db.query(`SELECT employee.first_name, employee.last_name FROM employee`, (err, data2) => {
      if (err) throw err;

      let managerArray = ['No Manager'];

      //For loop ot insert manager into an array
      for (let i = 0; i < data2.length; i++) {
        let manager = `${data2[i].first_name} ${data2[i].last_name}`
        managerArray.push(manager)
      }

      inquirer.prompt([{
        type: 'input',
        name: 'firstName',
        message: "What's the new employee's first name?",
        validate: input => {
          if (input && input.length <= 30) {
            return true;
          } else {
            return false;
          }
        }
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What's the new employee's last name?",
        validate: input => {
          if (input && input.length <= 30) {
            return true;
          } else {
            return false;
          }
        }
      },
      {
        type: 'list',
        name: 'role',
        message: "What is the new employee's role?",
        choices: roleArray
      },
      {
        type: 'list',
        name: 'manager',
        message: "Who is the manager of the new employee?",
        choices: managerArray
      }
      ]).then(function (data3) {
        let firstname = data3.firstName;
        firstname = firstname.replace(/\s+/g, '-');

        let lastname = data3.lastName;
        lastname = lastname.replace(/\s+/g, '-');

        let managername = data3.manager;
        let sql1 = `SELECT id FROM role WHERE title = '${data3.role}'`
        if (managername != 'No Manager') {
          managername = managername.split(" ");
          let managerfirstname = managername[0];
          let managerlastname = managername[1];
          sql1 = `SELECT id FROM role WHERE title = '${data3.role}' UNION SELECT id FROM employee WHERE first_name = '${managerfirstname}' AND last_name = '${managerlastname}'`
        }

        //MySQL call to get the ID of employee selected from the array
        db.query(sql1, (err, data4) => {
          if (err) throw err;

          //MySQL call to insert employee's first name, last name, role, and manager into employee table
          let sql2 = '';
          if (data4.length === 1 && managername === 'No Manager') {
            sql2 = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                VALUES ('${firstname}','${lastname}','${data4[0].id}', null)`
          } else if (data4.length === 1) {
            sql2 = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                VALUES ('${firstname}','${lastname}','${data4[0].id}','${data4[0].id}')`
          } else {
            sql2 = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                VALUES ('${firstname}','${lastname}','${data4[0].id}','${data4[1].id}')`
          }
          db.query(sql2, (err) => {
            if (err) throw err;

            promptUser();
          });
        });
      });
    });
  });
}

//Function to update an employee role
function updateEmployeeRole() {

  // MySQL call to select employee's first and last name for an array
  db.query(`SELECT employee.first_name, employee.last_name FROM employee`, (err, data1) => {
    if (err) throw err;

    let employeeArray = [];

    //For loop to create an array of employees
    for (let i = 0; i < data1.length; i++) {
      let employee = `${data1[i].first_name} ${data1[i].last_name}`
      employeeArray.push(employee)
    }

    inquirer.prompt([{
      type: 'list',
      name: 'employee',
      message: "Which employee's role do you want to change?",
      choices: employeeArray
    }]).then(function (data2) {
      let employeename = data2.employee;
      employeename = employeename.split(" ");
      let employeefirstname = employeename[0];
      let employeelastname = employeename[1];

      //call to get roles for an array
      db.query(`SELECT role.title FROM role`, (err, data3) => {
        if (err) throw err;

        let roleArray = [];

        for (let i = 0; i < data3.length; i++) {
          let role = data3[i].title
          roleArray.push(role)
        }

        inquirer.prompt([{
          type: 'list',
          name: 'role',
          message: "What role do you want the employee to perform?",
          choices: roleArray
        }]).then(function (results) {

          //call that will select role id based on user selection
          db.query(`SELECT id FROM role WHERE title = '${results.role}'`, (err, moreresult) => {
            if (err) throw err;

            //call that will update a user role based on first and last name
            const sql = `UPDATE employee  
                                    SET role_id = '${moreresult[0].id}'
                                    WHERE first_name = '${employeefirstname}' AND last_name ='${employeelastname}'`

            db.query(sql, (err) => {
              if (err) throw err;
              promptUser();
            });
          });
        });
      });
    });
  });
}



// connects to mySQL
db.connect(err => {
  if (err) throw err;
  console.log()
})

// starts the applicaiton
initialize();
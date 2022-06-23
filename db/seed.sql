-- Department seeds
INSERT INTO department (id, name)
VALUES
(1, 'Sales'),
(2, 'Human Resources'),
(3, 'Finance'),
(4, 'Health');

-- Employee role seeds
INSERT INTO role (id, title, salary, department_id)
VALUES
(1, 'Sales Lead', 100000, 1), 
(2, 'Salesperson', 70000, 1), 
(3, 'HR Manager', 80000, 2), 
(4, 'HR Crew', 40000, 2), 
(5, 'Account Manager', 120000, 3), 
(6, 'Accountant', 90000, 3), 
(7, 'Doctor', 170000, 4), 
(8, 'Nurse', 120000, 4); 

-- Employee seeds
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Monica', 'Geller', 1, null),
('Joey', 'Tribiani', 2, 1), 
('Kyle', 'Yang', 3, null), 
('Rachel', 'Green', 4, 3),
('Phoebe', 'Buffay', 5, null),
('Ross', 'Geller', 6, 5), 
('Chandler', 'Bing', 7, null), 
('Allyson', 'Vitug', 8, 7); 

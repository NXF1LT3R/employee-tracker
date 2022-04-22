DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
id INT AUTO_INCREMENT PRIMARY KEY,
name varchar(30) NOT NULL );

CREATE TABLE role (
id INT AUTO_INCREMENT PRIMARY KEY,
title varchar(30) NOT NULL,
salary DECIMAL NOT NULL,
department_id INT NOT NULL, 
FOREIGN KEY (department_id) REFERENCES departments (id)
);

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name varchar(30) NOT NULL,
    last_name varchar(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT,
    FOREIGN KEY (role_id) REFERENCES role (id),
    FOREIGN KEY (manager_id) REFERENCES employees (id)
);


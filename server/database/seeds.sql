DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS users;


CREATE TABLE users(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(20) NOT NULL,
    email VARCHAR(200) NOT NULL,
    password VARCHAR(200) NOT NULL,
    UNIQUE (email)
    
);

INSERT INTO users (name, email, password) VALUES
    ('Simon', 'simon@gmail.com', '123456'),
    ('Atheer','atheer@gmail.com', '123456'),
    ('Mugisha', 'Mugisha@gmail.com', '123456'),
    ('Jamie','Jamie@gmail.com', '123456')
;

CREATE TABLE activities(
    id serial PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    description VARCHAR(500),
    streak int NOT NULL,
    latest_date date NOT NULL,
    name_id int REFERENCES users (id)  NOT NULL
);

INSERT INTO activities (name, description, streak, latest_date, name_id) VALUES 
    ('water','Drink 8 glasses per day', 6, '2020-09-07',4),
    ('water','Drink 10 glasses per day', 6, '2020-09-05',1),
    ('sleep','Sleep 8 hours a night', 8, '2020-09-07',4),
    ('exercise','Exercise 60 mins per day', 0, '2020-09-01',3),
    ('food','Eat 5 fruits and veg per day', 60, '2020-09-07',4)
   ; 
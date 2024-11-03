# Orgnocal

## Introduction

An enterprise-grade project management application. This application is built with React.js,
Next.js, Prisma ORM, and PostgreSQL and deployed with several AWS services.

[Deployed App](https://orgnocal.bradleyfellstrom.com/)

## Tech Stack

- **Front-end (orgnocal-app):** TypeScript, React.js, Next.js, Redux Toolkit, Tailwind CSS
- **Back-end (orgnocal-api):** Node.js, Express.js, Prisma ORM, PM2
- **Relational Database:** PostgreSQL
- **AWS Cloud:** EC2, VPC, RDS, API Gateway, AWS Amplify, Cognito, Lambda, Route53

## Set-up and run the environment

### Requirements

The following tools are needed to build and run the application:

- Git 
- npm
- Node.js
- PostgreSQL 
- (Recommended DBMS platform, although not required to use alongside PostgreSQL) pgAdmin

### Installation

1. Clone repo:
- `git clone git@github.com:Bronstrom/orgnocal.git` (using SSH)

2. Install Front-end & Back-end deps:
- `cd orgnocal`
- `cd orgnocal-app`
- `npm i`
- `cd ../orgnocal-api`
- `npm i`

3. Prepare Relational Database (using pgAdmin as DBMS platform):
- Create a local server
  - Provide a server name, host name and port, and a super user username and password (note these
  configurations will be used for the environment variables later)
- Create a database for your server
  - Provide a name and "Save"
- For more information on how to set-up a server and database with pgAdmin you can view the
following docs: https://www.pgadmin.org/docs/pgadmin4/latest/connecting.html

4. Add environment variables:
- Create `.env` for the Back-end in `orgnocal-api` with the following configurations:
  - `PORT=8000`
  - `DATABASE_URL="postgresql://[SUPERUSER]:[SUPERUSER-PASSWORD]@[HOSTNAME:PORT]/[DATABASE]?schema=public"`
    - These values should match what is configured in your PostgreSQL database
    - `HOSTNAME:PORT` by default is `localhost:5432`
- Create `.env.local` for the Front-end in `orgnocal-app` with the following configurations:
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` (should match Back-end `PORT`)
  - (Only for AWS Cognito connection) `NEXT_PUBLIC_COGNITO_USER_POOL_ID` with it's matching ID in
  Cognito
  - (Only for AWS Cognito connection) `NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID`  with it's matching
  ID in Cognito

5. Set-up Relational Database (in `orgnocal-api`):
- `npx prisma generate`
- `npx prisma migrate dev --name init`
- `npm run seed`

6. Relational Database Clean-up
- Once seeding the database with the previous command, the ID will need to be adjusted for each
database table that was seeded. Use the following query template to adjust the ID for each table:

```sql
SELECT setval(pg_get_serial_sequence('"[TABLE]"', 'id'), coalesce(max(id)+1, 1), false) FROM "[TABLE]";
```

7. Run the application
- In two seperate terminal windows navigate to `orgnocal-app` in one and `orgnocal-api` in the other.
- Run the following command in both windows to start the application:
  - `npm run dev`

## Diagrams

The following wiki pages include Lucidchart diagrams demonstrating how I architected the project:

- [AWS Architecture Diagram](https://github.com/Bronstrom/orgnocal/wiki/Orgnocal-AWS-Architecture-Diagram)
- [Entity relationship diagram (ERD)](https://github.com/Bronstrom/orgnocal/wiki/Orgnocal-ERD)

## Reflection

### Challenges

#### Application Challenges

By far, the most challenging part with the "Hierarchy" view. This representation was difficult to
manage in a front-end data structure and I needed to change my ERD to ensure this view worked
correctly with nested tasks. I think the drag-in-drog approach and layering system added to the
challenge. In some ways I still don't feel like the view is perfected yet, and I have considered
changing it. Originally, I was thinking about making a Tree View for this visualization, but I
don't think it captured the similar layers between the different hierarchy structures well.

#### A Challenge with Lambda

Another major challenge, and a rabbit hole at that, was debugging my AWS Lambda function that
is triggered on a AWS Cognito user getting created. I had some troubles with creating a user
initially with Cognito and registering them in the database. In my AWS architecture, I set-up a
Lambda function to be triggered once Cognito adds a user to its user pool, where Lambda sends the
user's Cognito ID and PII (Personally Identifiable Information) registered in Cognito to the RDS
database. Lambda then sends this information through the API Gateway, to EC2 which is then sent to
the private subnet where my RDS database lives. Through debugging the problem I had scrubbed
through every layer of this communication channel and used CloudWatch to get reports on error
statuses. Initially, the problem appeared to be that the endpoint I was calling in Lambda was being
registered as a 500 code in API gateway, to later there being an issue with the EC2 not accepting
the request, and RDS not being able to add the user at the specified identifier. I eventually dug
into the private database by using EC2 as a bastion host and found the seeded data had caused an
issue with how I was incrementing the IDs. It was very rewarding to see my progress resolving each
problem along the way and eventually add a new user to RDS.

### Outcome

I think this tool is quite versatiles and accomplishes my personal goals. I could see past teams
I've worked with finding this beneficial as this would better fit some of our desires to see
relationships between tasks and projects. As far as the organization concept goes I think it works
fairly well, but can be fine tuned to be more streamlined. In general I think navigation is pretty
snappy, you can get to project and org pages quickly. One of my other goals for this project was to
make this application feel as close to an enterprise project that I've completed on my own terms. I
do feel like this touches the bases on making it on the level of an enterprise application and this
parallels a few of the projects I've developed as a Software Engineer. Also it feels like I built
an enterprise tool with how it's deployed in AWS and just the general layout of the application
with dashboard views.

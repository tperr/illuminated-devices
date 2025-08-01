# Illuminated Devices

You can view the website as is [here](https://illuminated.cs.mtu.edu).

Our team is designing a sociotechnical system called Illuminated Devices to supplement and extend [BASIC (Basic Adult Skills in Computing)](https://www.mtu.edu/unscripted/2017/03/basic-saturdays.html), a community-based tutoring program. COVID-19 required us to suspend this face-to-face program, leaving community members—especially those who do not have the skills or confidence to seek technology help online—without any assistance. Our current project seeks to provide remote technology training via video calling on a portable device.

We currently have 2 publications as a result of this work:
- [Breaking Digital Barriers: Designing a Sociotechnical System for Remote Digital Assistance](https://peer.asee.org/46774)
- [Identifying and Addressing Risks in the Early Design of a Sociotechnical System through Premortem](http://dx.doi.org/https://doi.org/10.1177/1071181322661307)

This work is supported by the National Science Foundation under [Grant #BCS-2122034](https://www.nsf.gov/awardsearch/showAward?AWD_ID=2122034).

File structure:
/ark
This contains code for the main database, from the api requests themselves to the sql code of each of the procedures
/ark/lib
Contains python code to help describe how ark should work
/ark/routes
Specific logic for api endpoints for different users of the app
/ark/sql_scripts
Contains sql scripts outlining the procedures of ark
In the current folder you will find the current declarations of each of the procedures
/ark/index.py
Sets up connections to ark
/ark/socketer.py
Sets up backend socket logic
/ark/start_ark.sh
Bash script that starts up ark

/blacklight
This contains logic for database pertaining to logging in logic.
This file structure operates the same as the structure of ark

/portal
All of the code for the front end website
/portal/public
Public files, such as images
/portal/src
Source file for all React.js code
/portal/src/assets
Universal assets
/portal/src/pages
Logic for each of the pages
/portal/src/pages/Device
Logic for each device
/portal/src/pages/[LocationManagement,OrganizationHome,Provider]
Logic for provider pages, at one point meant for differentiating between organizations and locations however time only permitted organizations logic
OrganizationHome is the page that libraries will interact with to check out devices
/portal/src/pages/[SuperTutor,Tutor]
Logic for tutors and super tutors
In the future will combine and simplify
/portal/src/subscript
Logic for more universal functions
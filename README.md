# DFSProject 

This is a personal project that is a website used for daily fantasy sports. Currently only mlb is supported.

# Background on Daily Fantasy Sports

In daily fantasy sports, participants create daily lineups by picking athletes. The athletes are given points based on their performance for a given sports game. The better an athlete performs, the more points they are given. However, each athlete is assigned a salary and the participant is given a salary cap. The total salary of the lineup must be within the salary cap. Generally, better athletes have higher salaries. 

https://www.youtube.com/watch?v=D8DweQK0b88

# Synopsis

This website uses PHP, JS, jQuery, SQL, HTML, and CSS. It is hosted on heroku and uses JawsDB MySQL. First the application scrapes sports statistics from a sports site and stores the data. From the data, projections are made for athletes based on their yearly performance, recent performance, and their opposition. Finally, an algorithm for a lineup optimizer determines the top lineups by maximizing the projected points while staying within the salary cap. User features include removing unwanted athletes and altering their projections. 

# Motivation

I created this website because I wanted to create a DFS tool to find good lineups. In addition, I am interested in the tech industry and created an application to showcase my skills using a personal interest. 

# Future Considerations 

1)	Build a bankroll tool that accepts csv file with your contest history and displays your progress including ROI. 
2)	Include NHL projections and lineup optimization.
3)	Create API to get data. In same API be able to post information such as related DFS links in a blogroll on the website.
4)	Create CMS in Ruby/Rails that posts the information for the related DFS link. 



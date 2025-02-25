# Switchplay

## Intro

A working prototype for a data-driven player development platform for football academies, designed to be used by players, coaching staff, and multidisciplinary teams of staff that included sports scientists, medical professionals, psychologists, and other stakeholders.

This prototype is responsive to laptop, table and mobile screens. However, a fully productionised version will only be released in conjunction with a React Native mobile app, because players in particular are more likely to engage via a mobile app, and this tool is a player-centred tool.

The code is not productionised - it is to be used for iterative design, demos and small scale trials with non-sensitive data and non-critical clients, such as staff and players from a lower league/semi-professional football club.

## Iterations

There have been 3 main iterations. All remain in the main branch at the moment(this will change), but only Cards is rendered.

Most Recent: Cards https://github.com/petedomokos/switchplay/tree/master/client/core/cards 

A player's developmental journey is reflected using the metaphor of a pack of playing cards, each one representing a match or a week.
Data is tracked, and the status of the cards are autmatically updated. The aim is for all cards to be completed, depicted by a completely gold ring,
where all measures that contribute to the player's development have a piece of the ring.

Previous: Milestones Bar https://github.com/petedomokos/switchplay/blob/master/client/core/journey/MilestonesBar.js

The cards idea came out of this milestone bar, which was a set of milestones on cards, progressing gradually from left to right.
This was a more mobile-friendly UI, important for players and coaches who access the app through mobiles rtaher than larger screens.

Initial: Journey https://github.com/petedomokos/switchplay/blob/master/client/core/journey/Journey.js

This was a blank canvas in which players and staff members could collectively map out there goals and milestones.
It shows their developmental journey well, but is not very user-friendly for mobile screens.

## Technical setup

The project uses a MERN Stack plus D3.

The Node-Mongo DB setup is ideal for the current 'startup' nature of this project, where trials are tightly controlled and datasets are small. However, once we are wiring up larger datasets, such as positional tracking of players on the pitch, the data will be manipulated/summarised/reduced via a python data analytics web service that we will set up and access with a node child_process.



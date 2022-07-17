import React from 'react'
import { AboutMenu } from './Menus'
import { Route }from 'react-router-dom'
import welcomeImage from '../assets/images/welcome-image.jpg'
//import { missionText,  }

/**
* Simple component with a submenu and subcomponents of content about the app
**/
const About = ({ match }) =>
	<section className="about main-page">
		<AboutMenu/>
		<Route exact path="/about" component={Mission} />
		<Route path="/about/how-it-works" component={Product} />
		<Route path="/about/build-info" component={History} />
		<Route path="/about/what-people-say" component={Team} />
	</section>

//TODO - make this a higher-order component and pass content in from file
const Mission = () =>
	<section className='mission'>
		<div className='text'>
            <h1>
                Switchplay supports football coaches and players to adopt 
                a purposeful data-driven approach to development.
             </h1>
		
		</div>
	</section>

//TODO - make this a higher-order component and pass content in from file
const Product = () =>
	<section className='product'>
		Product
	</section>

//TODO - make this a higher-order component and pass content in from file
const History = () =>
	<section className='history'>
		History
	</section>

//TODO - make this a higher-order component and pass content in from file
const Team = () =>
	<section className='team'>
		Team
	</section>


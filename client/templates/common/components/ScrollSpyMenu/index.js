import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import Scrollspy from "react-scrollspy";
import AnchorLink from "react-anchor-link-smooth-scroll";
import {Link, withRouter} from 'react-router-dom'
import Button from '@material-ui/core/Button'
import * as d3 from 'd3';

import { DrawerContext } from "../../contexts/DrawerContext";
import NextImage from "../NextImage";
/*
todo next - when user signed in,
 -  the menu is always the burger menu - check it works
 -  the menu items should be completely different, so remove all except -> "import", "signout" only for now
*/

const RenderLinkWithIcon = ({ item }) => {
	return (
		<div className="icon-login">
			{item.icon ? (
				<NextImage className="icon" src={item.icon} alt={item.label} />
			) : (
				""
			)}
			<a
				className={item.icon ? "icon-label" : "no-icon-label"}
				href={item.path}
			>
				{item.label}
			</a>
		</div>
	);
};

const PageLinkItem = ({ item, pathname }) =>  
	<Link to={item.path} 
		style={{ color: pathname === item.path ? "#FF825C" : "#02073E" }}
		onClick={() => {
			if(item.page === "home" && item.id !== "home"){
				window.manualScrollId = item.id;
			}else{
				window.manualScrollId = null;
			}
		}}
		>
		{item.label}
	</Link>

const ClickButtonItem = ({ item, history }) =>
	<div
		style={{ cursor: "pointer", marginTop:"10px", marginBottom:"10px" }}
		className={"click-button-menu-item"}
		onClick={() => item.onClick(history)}>{item.label}
	</div>

export const NormalItem = ({ item, history }) => {
	return (
		<>
			{item.itemType === "page-link" ? 
				<PageLinkItem item={item} pathname={history.location.pathname} />
				:
				<ClickButtonItem item={item} history={history} />
			}
		</>
	)
}

const ScrollSpyMenu = ({ className, menuItems, drawerClose, history, ...props }) => {
	const { dispatch } = useContext(DrawerContext);
	//@todo - move into the context
	const [page, setPage] = useState("");
	// empty array for scrollspy items
	const scrollItems = [];

	// convert menu path to scrollspy items
	menuItems.forEach((item) => {
		scrollItems.push(item.path.slice(1));
	});

	// Add all classs to an array
	const addAllClasses = ["scrollspy__menu"];

	// className prop checking
	if (className) {
		addAllClasses.push(className);
	}

	// Close drawer when click on menu item
	const toggleDrawer = () => {
		dispatch({
			type: "TOGGLE",
		});
	};

	return (
		<Scrollspy
			items={scrollItems}
			className={addAllClasses.join(" ")}
			drawerClose={drawerClose}
			{...props}
		>
			{menuItems.map((item, index) => (
				<li key={`menu-item-${item.id}`}>
					{item.itemType === "click-button" || item.itemType === "page-link" ?
						<NormalItem item={item} history={history} />
					 	:
						item.staticLink ? (
							<RenderLinkWithIcon item={item} />
						) : (
							<>
								{drawerClose ? (
									<AnchorLink
										href={item.path}
										offset={item.offset}
										onClick={toggleDrawer}
									>
										{item.label}
									</AnchorLink>
								) : (
									<AnchorLink href={item.path} offset={item.offset}>
										{item.label}
									</AnchorLink>
								)}
							</>
						)
					}
					
				</li>
			))}
		</Scrollspy>
	);
};

ScrollSpyMenu.propTypes = {
	/** className of the ScrollSpyMenu. */
	className: PropTypes.string,

	/** menuItems is an array of object prop which contain your menu
	 * data.
	 */
	menuItems: PropTypes.array.isRequired,

	/** Class name that apply to the navigation element paired with the content element in viewport. */
	currentClassName: PropTypes.string,

	/** Class name that apply to the navigation elements that have been scrolled past [optional]. */
	scrolledPastClassName: PropTypes.string,

	/** HTML tag for Scrollspy component if you want to use other than <ul/> [optional]. */
	componentTag: PropTypes.string,

	/** Style attribute to be passed to the generated <ul/> element [optional]. */
	style: PropTypes.object,

	/** Offset value that adjusts to determine the elements are in the viewport [optional]. */
	offset: PropTypes.number,

	/** Name of the element of scrollable container that can be used with querySelector [optional]. */
	rootEl: PropTypes.string,

	/**
	 * Function to be executed when the active item has been updated [optional].
	 */
	onUpdate: PropTypes.func,
};

ScrollSpyMenu.defaultProps = {
	componentTag: "ul",
	currentClassName: "is-current",
};

export default ScrollSpyMenu;

import React, { useEffect, useState } from 'react';
/*export const withLoader = (propsToCheck, cb) => component =>{
    console.log('Hi from hoc')
    const { props } = component;
    const propsFailed= propsToCheck.map(propToCheck => 
        typeof props[propToCheck.path] === propToCheck.propType);
    if(propsFailed.length !== 0){
        cb(propsFailed);
    }
    return(component);
}*/
/*
-can get a extraLoadArg prop, which is passed back to the onLoad function
 - must receive an onLoad function in props, but omitting it conditionally can be a way of loading only when needed
 - whileNotLoaded option allows more granular control over what is displayed whilst loading props 
   (a) alwaysRender - passes responsibility for handling non-loaded props to the wrapped component
   (b) LoadingPlaceholder - renders a custom placeholder while loading
   (b) ErrorPlaceholder - renders a custom placeholder if error
*/

//need to rethink the load thing - maybe should be settings or loadInfoObject,

//todo - add a signal to optionally cancel the load if user unmounts before completion
export function withLoader(ComponentWhenLoaded, propsToCheck=[], options={}){
    const { whileNotLoaded, allow } = options;
    const allowedValues = allow || [0];
    const notLoadedOptions = whileNotLoaded || {};
    //when loader is called, eg by UserContainer, it is passed the props
    const loader = props => {
        //console.log('HOC.................props', props)
        //note: we dont control the loading state here - it is contained in store as other components may also load this resource
        const {extraLoadArg, onLoad, loading, loadingError, ...passedThroughProps} = props;
        //1. CHECK IF PROPS MISSING
        //need to check props have all been loaded ( 0 and false are ok) every time in case page refreshed etc
        
        //a function that tests for various conditions which mean prop needs to be loaded
        const failed = prop => {
            //console.log('prop', prop)
            let propValueAllowed = false;
            allowedValues.forEach(allowedValue =>{
                if(prop === allowedValue){
                    propValueAllowed = true;
                }
            })
            return !propValueAllowed && !prop;
        }
        
        //recursively check complex paths existence eg group.players
        const checkProp = propPath => {
            const checkNext = (nextPartOfPath, lookIn, remaining) =>{
               // console.log('checkNext nextPartOfPath', nextPartOfPath)
                //console.log('checkNext lookIn', lookIn)
                //console.log('checkNext remianing', remaining)
                //test pathSoFar
                const propObject = lookIn[nextPartOfPath];
               //console.log('propObject', propObject)
                
                if(failed(propObject)){
                   //console.log('failed!')
                    return false;
                }
              // console.log('passed')
                if(remaining[0]){
                    //there is a next part of path, so look in the object returned for that
                    return checkNext(remaining[0], propObject, remaining.slice(1,10))
                }
                //no more parts of path left to check
                return true;
            };
            //split path into array
            const splitPath = propPath.split('.');
           //console.log('initial check ')
            return checkNext(splitPath[0], props, splitPath.slice(1,10))
        }        
        const propsToLoad = propsToCheck.filter(propPath => !checkProp(propPath))

        //console.log('Loader propsTocheck', propsToCheck)
        //console.log('Loader propsToload', propsToLoad)
        //console.log('loading?', loading)
        
        //2. ASYNC LOAD PROPS IF MISSING (AFTER RENDER)
        useEffect(() =>{
            if(propsToLoad.length !== 0 && !loading && onLoad){
                onLoad(propsToLoad, extraLoadArg);
            }
        })
        //3. RENDERING
        if(propsToLoad.length === 0){
            //doesnt need to receive props about load status
            return <ComponentWhenLoaded {...passedThroughProps} />;
        }
        //3 options while props not loaded - load anyway, load custom placeholder, load default placeholder
        const { alwaysRender, LoadingPlaceholder, ErrorPlaceholder } = notLoadedOptions;
        if(alwaysRender){
            //needs props about load status so it can handle
            return <ComponentWhenLoaded {...passedThroughProps} loading={loading} error={error}/>;
        }
        if(loading){
            return LoadingPlaceholder || <div>Loading...</div>;
        }
        if(loadingError){
            return ErrorPlaceholder || <div>Server Error</div> 
        }   
        return null;    
    }
    return loader;

}

/*
 useEffect(() =>{
            if(!loading && onLoad){
                //need to check props have all been loaded ( 0 and false are ok)
                const propsToLoad = propsToCheck.filter(propToCheck =>
                    props[propsToCheck] !== 0 && props[propsToCheck] !== false && !props[propToCheck])
                console.log('Loader props', props)
                console.log('Loader propsTocheck', propsToCheck)
                console.log('Loader propsToload', propsToLoad)
                if(propsToLoad.length !== 0){
                    onLoad(userId, propsToLoad);
                }else{
                    setPropsLoaded(true);
                }
            }
        })
        */

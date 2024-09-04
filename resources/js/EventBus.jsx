import React from "react";

/**
 * The Event Bus in this code snippet helps build a system that listens and broadcasts events between components in a React application
 * without having to create a complex component tree with multiple levels of prop passing or using a big state management library.
 */

// Declare Event Bus Context | Share values to all registered component
export const EventBusContext = React.createContext();

// Target to props two funcions of Provider of EventBusContext to child components
export const EventBusProvider = ({ children }) => {
    const [events, setEvents] = React.useState({});

    /**
     * Broadcast existed event with data to corresponding callback
     */
    const emit = (name, data) => {
        if (events[name]) {
            for (let cb of events[name]) {
                cb(data)
            }
        }
    };

    /**
     * Set key(callback name) => value(callback) if it does not exist | ex: {[massage.created => messageCreated]}
     * Target: register an event
     * */
    const on = (name, cb) => {
        if (!events[name]) {
            events[name] = [];
        }
        events[name].push(cb); 

        // unregister the old callback
        return () => {
            events[name] = events[name].filter((callback) => callback !== cb); 
        };
    }

    return (
        <EventBusContext.Provider value={{emit, on}}>
            {children}
        </EventBusContext.Provider>
    );
};

// used to read EventBusContext | allow other use functions of EventBusContext
export const useEventBus = () => {
    return React.useContext(EventBusContext)
}

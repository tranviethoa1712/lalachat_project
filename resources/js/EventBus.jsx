import React from "react";

// Declare Event Bus Context
export const EventBusContext = React.createContext();

// Target to props two funcions of Provider of EventBusContext to child components
export const EventBusProvider = ({ children }) => {
    const [events, setEvents] = React.useState({});

    /**
     * change data of the callback
     */
    const emit = (name, data) => {
        if (events[name]) {
            for (let cb of events[name]) {
                cb(data)
            }
        }
    };

    /**
     * Set key(callback name) => value(callback) | ex: {[massage.created => messageCreated]}
     * Target: cache function
     * */
    const on = (name, cb) => {
        if (!events[name]) {
            events[name] = [];
        }
        events[name].push(cb); 

        return () => {
            events[name] = events[name].filter((callback) => callback !== cb); // ????
        };
    }

    return (
        <EventBusContext.Provider value={{emit, on}}>
            {children}
        </EventBusContext.Provider>
    );
};

// used to read EventBusContext
export const useEventBus = () => {
    return React.useContext(EventBusContext)
}
import { useState, useEffect } from 'react';
import { TextField, Button, DialogActions, Select, MenuItem, InputLabel } from "@mui/material";
import moment from 'moment';
import makeRequest from '../axios/axios';

const CustomEditor = ({ scheduler }) => {

    const event = scheduler.edited;

    const start_time_obj = new Date(scheduler.state.start.value);
    const end_time = scheduler.state.end.value;

    const [state, setState] = useState({
        name: event?.title || "",
        phone: event?.phone || "",
        lead: event?.lead || "",
        amount: event?.amount || "",
        start: scheduler.state.start.value,
        end: scheduler.state.end.value,
    });

    const [error, setError] = useState("");
    const [timeError, setTimeError] = useState("");

    const [menuOptions, setMenuOptions] = useState([]);


    useEffect(() => {
        const options = genMenuOptions();
        setMenuOptions(options);
    }, []);

    const handleChange = (value, name) => {
        setState((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const genMenuOptions = () => {
        const end_date_obj = (!event) ? new Date(scheduler.state.end.value) : new Date(scheduler.state.start.value);
        const timeOptions = [];
        var new_date_obj = new Date(moment(end_date_obj).add(30, 'minutes'));

        while (new_date_obj.toLocaleDateString() === start_time_obj.toLocaleDateString()) {
            if (end_time.valueOf() != new_date_obj.valueOf())
                timeOptions.push(new_date_obj.valueOf())
            new_date_obj = new Date(moment(new_date_obj).add(30, 'minutes'));
        }

        timeOptions.push(new_date_obj.valueOf())

        return timeOptions;
    }

    const handleSubmit = async () => {
        if (state.name.length < 3) {
            return setError("Title must be at least 3 characters");
        }

        scheduler.loading(true);

        const added_updated_event = {
            event_id: event?.event_id || Math.floor(Math.random() * 1000000),
            title: state.name,
            start: scheduler.state.start.value,
            end: typeof (state.end) !== 'number' ? state.end : new Date(state.end),
            phone: state.phone,
            lead: state.lead,
            amount: state.amount,
            admin_id: scheduler.admin_id,
        };

        scheduler.onConfirm(added_updated_event, event ? "edit" : "create");

        if (!event) {
            try {
                await makeRequest('POST', '/events', added_updated_event);
                scheduler.onConfirm(added_updated_event, event ? "edit" : "create");

            } catch (e) {
                console.log("Failed to Create", e)
                scheduler.loading(false);
                return setTimeError(e.response.data.error);

            }
        } else {
            try {
                await makeRequest('PUT', `/events/${event?.event_id}`, added_updated_event);
                scheduler.onConfirm(added_updated_event, event ? "edit" : "create");

            } catch (e) {
                console.log("Failed to Edit", e)
                scheduler.loading(false);
                return setTimeError(e.response.data.error);
            }
        }

        scheduler.close();
        scheduler.loading(false);
    };

    return (
        <div>
            <div style={{ padding: "1rem" }}>
                <p>Enter Booking Details</p>
                <TextField
                    label="Client Name"
                    value={state.name}
                    onChange={(e) => handleChange(e.target.value, "name")}
                    error={!!error}
                    fullWidth
                    style={{ marginBottom: "1rem" }}
                />
                <TextField
                    label="Phone No"
                    value={state.phone}
                    onChange={(e) => handleChange(e.target.value, "phone")}
                    fullWidth
                    style={{ marginBottom: "1rem" }}
                />
                <TextField
                    label="Lead"
                    value={state.lead}
                    onChange={(e) => handleChange(e.target.value, "lead")}
                    fullWidth
                    style={{ marginBottom: "1rem" }}
                />
                <TextField
                    label="Amount"
                    value={state.amount}
                    onChange={(e) => handleChange(e.target.value, "amount")}
                    fullWidth
                    style={{ marginBottom: "1rem" }}
                />

                <InputLabel htmlFor="start-select">Start Time</InputLabel>
                <Select
                    id="start-select"
                    value={state.start}
                    style={{ marginBottom: "1rem" }}
                    fullWidth
                    disabled
                >
                    <MenuItem value={state.start}>{new Date(state.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</MenuItem>
                </Select>

                <InputLabel htmlFor="end-select">End Time</InputLabel>
                <Select
                    id="end-select"
                    value={state.end}
                    onChange={(e) => handleChange(e.target.value, "end")}
                    style={{ marginBottom: "1rem" }}
                    fullWidth
                    error={!!timeError}
                >
                    <MenuItem value={end_time}>{new Date(end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</MenuItem>

                    {menuOptions.map((time, index) => (
                        <MenuItem key={index} value={time}>{new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</MenuItem>
                    ))}
                </Select>
                {timeError && <p style={{ color: 'red', marginTop: '-0.5rem', marginBottom: '1rem' }}>{timeError}</p>}

            </div>
            <DialogActions>
                <Button onClick={scheduler.close}>Cancel</Button>
                <Button onClick={handleSubmit}>Confirm</Button>
            </DialogActions>
        </div>
    );
};

export default CustomEditor;
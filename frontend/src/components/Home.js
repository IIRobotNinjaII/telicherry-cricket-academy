import { Fragment } from 'react';
import { Scheduler } from "@aldabil/react-scheduler";
import { Button } from "@mui/material";
import avatar from "../assets/cricket.jpg";
import { doSignOut } from '../firebase/auth';
import { useAuth } from '../contexts/authContext'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Navigate } from 'react-router-dom'
import makeRequest from '../axios/axios';
import CustomEditor from './CustomEditor';

const fetchRemote = async (query) => {
  try {
    const response = await makeRequest('GET', `/events/${query.start.toISOString()}/${query.end.toISOString()}`);
    const events = response.data.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
    return events;

  } catch (error) {
    console.error('Error fetching remote data:', error);
    throw error;
  }
};

const handleDelete = async (id) => {

  try {
    await makeRequest('DELETE', `/events/${id}`)
    return id;
  } catch (e) {
    console.log("Failed to deleted", e)
  }
};

const handleSignOut = async () => {
  await doSignOut();
};

const Home = () => {

  const { userLoggedIn } = useAuth()

  return (
    <>
      {!userLoggedIn && (<Navigate to={'/'} replace={true} />)}
      <Fragment>
        <Box sx={{ textAlign: 'center', position: 'relative', p: 2 }}>
          <Typography variant="h4" component="h2">
            Tellicherry Cricket Academy
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{
              position: 'absolute',
              right: 20,
              top: 20,
              '@media (max-width:600px)': {
                position: 'relative',
                right: 'auto',
                top: 'auto',
                mt: 2
              }
            }}
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </Box>

        <Scheduler
          view="week"
          customEditor={(scheduler) => <CustomEditor scheduler={scheduler} />}
          viewerExtraComponent={(fields, event) => (
            <div>
              <p>Name: {event.title || "Not provided"}</p>
              <p>Phone: {event.phone || "Not provided"}</p>
              <p>Lead: {event.lead || "Not provided"}</p>
              <p>Amount: {event.amount || "Not provided"}</p>
            </div>
          )}
          week={
            {
              startHour: 9,
              endHour: 24,
              step: 30,
              disableGoToDay: true,

            }
          }
          disableViewNavigator
          resources={
            [
              {
                admin_id: 1,
                title: "Turf 1",
                color: "#ab2d2d",
                avatar: avatar
              },
              {
                admin_id: 2,
                title: "Turf 2",
                color: "#58ab2d",
                avatar: avatar
              },
              {
                admin_id: 3,
                title: "Turf 3",
                color: "#a001a2",
                avatar: avatar
              },
              {
                admin_id: 4,
                title: "Cement Pitch 1",
                color: "#08c5bd",
                avatar: avatar
              },
              {
                admin_id: 5,
                title: "Cement Pitch 2",
                color: "#3b3b6d",
                avatar: avatar
              },
              {
                admin_id: 6,
                title: "Full Ground",
                color: "#ef8354",
                avatar: avatar
              },
            ]
          }
          resourceFields={{
            idField: "admin_id",
            textField: "title",
            colorField: "color"
          }}
          resourceViewMode="tabs"
          getRemoteEvents={fetchRemote}
          // onDelete={handleDelete}
        />

      </Fragment>
    </>
  );
}

export default Home;
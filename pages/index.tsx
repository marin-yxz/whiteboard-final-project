import 'doodle.css/doodle.css';
import _ from 'lodash';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import styled from 'styled-components';
import { getAllRooms } from '../util/database';

const TitleDiv = styled.div`
  @import url('https://fonts.googleapis.com/css2?family=Edu+VIC+WA+NT+Beginner:wght@472&display=swap');
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Edu VIC WA NT Beginner', cursive;
  font-size: 4vw;
  font-weight: 472;
  margin: 0;
  padding: 0;

  padding-left: 5vw;
  padding-right: 10vw;
  border-radius: 30% 70% 100% 0% / 0% 0% 100% 100%;
  background-color: #faedcd;
  height: 80vh;
`;
const CreateRoomDiv = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 30px;
  border: 1px solid red;
`;
const LinkRef = styled.a`
  padding: 5px;
  margin: 0;
  font-size: 2vw;
  border: 3px solid black;
  border-radius: 5px;
  background-color: #dda15e;
  cursor: pointer;
  :hover {
    background-color: #bc6c25;
  }
`;
const Container = styled.div`
  width: 40vw;
  height: 40vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;
const TopText = styled.h6`
  @import url('https://fonts.googleapis.com/css2?family=Edu+VIC+WA+NT+Beginner&display=swap');
  font-family: 'Edu VIC WA NT Beginner', cursive;
  font-weight: 300;
`;
const CreateRoom = styled.div`
  display: flex;
  align-items: center;
  padding-top: 5vh;
  height: 3vh;
  width: 30vw;
`;
const Join = styled.div`
  display: flex;
  justify-content: center;
`;
const Container2 = styled.div`
  /* height: 300px; */
  width: 50vw;
  margin-bottom: 29vh;
`;
let socket;
const NoActive = styled.div`
  font-size: 20px;
  text-align: center;
`;
const RoomDiv = styled.div`
  height: 10vh;
  font-size: 4vh;
  justify-content: center;
  align-items: center;
  text-align: center;
`;
export default function Home(props) {
  const [gameRooms, setGameRooms] = useState<
    { name: string; username: string }[]
  >([]);
  function makeid(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  useEffect(() => {
    const socketInitializer = async () => {
      await fetch('/api/socket');
      socket = io();
      socket.on('connect', () => {
        console.log(socket.id);
      });
      socket.on(
        'display-activeGame',
        (games: [{ name: string; username: string }]) => {
          const room = _.uniqBy(games, 'name');
          setGameRooms(room.reverse());
          console.log(games);
        },
      );
    };
    socketInitializer().catch(() => {});
  }, []);
  useEffect(() => {
    const propRooms: [{ name: string; username: string }] = props.rooms;
    const room = _.uniqBy(propRooms, 'name');
    setGameRooms(room.reverse());
  }, [props]);
  const link = makeid(30);
  return (
    <div>
      <Head>
        <title>Skribbly</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/pen.png" />
      </Head>
      <TitleDiv>
        <Container>
          <TopText style={{ margin: 0, padding: 0, paddingTop: '3vh' }}>
            Play a skribbl game on
          </TopText>
          <h5 style={{ margin: 0, padding: 0, paddingTop: '0.5vh' }}>
            Skribbly
          </h5>
          <CreateRoom>
            <Link href={'/draw/' + link}>
              <LinkRef className="doodle-border">create room and play!</LinkRef>
            </Link>
          </CreateRoom>
        </Container>
        <Container2 className="doodle">
          <Join>
            <h6 style={{ margin: 0, padding: 0, paddingTop: '0.5vh' }}>
              Join active games!
            </h6>
          </Join>
          <div>
            {gameRooms[0]?.name ? '' : <NoActive>no active games</NoActive>}
            {gameRooms.map((room, index) => {
              return (
                <RoomDiv key={room.username} className="doodle-border">
                  <Link href={'/draw/' + room.name}>
                    <a>Room {index + 1}</a>
                  </Link>
                </RoomDiv>
              );
            })}
          </div>
        </Container2>
      </TitleDiv>
    </div>
  );
}
export async function getServerSideProps() {
  const userRooms = await getAllRooms();
  console.log(userRooms);
  if (userRooms) {
    return {
      props: {
        rooms: userRooms,
      },
    };
  } else {
    return {
      props: {
        rooms: [],
      },
    };
  }
}

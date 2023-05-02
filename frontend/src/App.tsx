import { MantineProvider, Center, Container, Paper } from '@mantine/core';

import MbtaMapContent from './MbtaMapContent';
import './App.css'

function App() {
  return (
    <MantineProvider theme={{ colorScheme: 'dark' }}>
      <Container size={"xl"} m={"md"}>
        <MbtaMapContent />
      </Container>
    </MantineProvider>
  )
}

export default App

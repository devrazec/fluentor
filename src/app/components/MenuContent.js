'use client';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CategoryIcon from '@mui/icons-material/Category';

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon /> },
  { text: 'Categories', icon: <CategoryIcon /> },
  { text: 'Tasks', icon: <AssignmentRoundedIcon /> },
  { text: 'Analytics', icon: <AnalyticsRoundedIcon /> },
];

const secondaryListItems = [
  { text: 'IELTS Academic', icon: <MenuBookIcon /> },
  { text: 'IELTS General', icon: <MenuBookIcon /> },
  { text: 'TOEFL iBT', icon: <MenuBookIcon /> },
  { text: 'TOEFL Essentials', icon: <MenuBookIcon /> },
  { text: 'TOEIC Speaking', icon: <MenuBookIcon /> },
  { text: 'MET', icon: <MenuBookIcon /> },
  { text: 'PTE Academic', icon: <MenuBookIcon /> },
  { text: 'PTE General', icon: <MenuBookIcon /> },
  { text: 'Cambridge ', icon: <MenuBookIcon /> },
  { text: 'Cambridge Linguaskill', icon: <MenuBookIcon /> },
  { text: 'Duolingo', icon: <MenuBookIcon /> },
  { text: 'EF SET', icon: <MenuBookIcon /> },
  { text: 'IELP', icon: <MenuBookIcon /> },
  { text: 'Eng4skills', icon: <MenuBookIcon /> },
  { text: 'Tracktest', icon: <MenuBookIcon /> },
  { text: 'iTEP', icon: <MenuBookIcon /> },
  { text: 'Versant', icon: <MenuBookIcon /> },
];

export default function MenuContent() {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton selected={index === 0}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}

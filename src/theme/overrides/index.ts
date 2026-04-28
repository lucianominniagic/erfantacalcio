import type { Theme, Components } from '@mui/material/styles'

// third-party
import merge from 'lodash/merge'

// project import
import Badge from './Badge'
import Button from './Button'
import CardContent from './CardContent'
import Checkbox from './Checkbox'
import Chip from './Chip'
import DataGrid from './DataGrid'
import IconButton from './IconButton'
import InputLabel from './InputLabel'
import LinearProgress from './LinearProgress'
import Link from './Link'
import ListItemIcon from './ListItemIcon'
import OutlinedInput from './OutlinedInput'
import Tab from './Tab'
import TableCell from './TableCell'
import Tabs from './Tabs'
import Typography from './Typography'
import CardHeader from './CardHeader'
import Autocomplete from './Autocomplete'
import FormControlLabel from './FormControlLabel'
import TableHead from './TableHead'
import Card from './Card'

// ==============================|| OVERRIDES - MAIN ||============================== //

export default function ComponentsOverrides(theme: Theme) {
  return merge(
    Autocomplete(theme),
    Button(theme),
    Badge(theme),
    Card(),
    CardHeader(theme),
    CardContent(),
    Checkbox(theme),
    Chip(theme),
    DataGrid(theme),
    FormControlLabel(theme),
    IconButton(theme),
    InputLabel(theme),
    LinearProgress(),
    Link(),
    ListItemIcon(),
    OutlinedInput(theme),
    Tab(theme),
    TableHead(theme),
    TableCell(theme),
    Tabs(),
    Typography(),
  ) as Components<Theme>
}

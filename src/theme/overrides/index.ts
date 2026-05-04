import type { Theme, Components } from '@mui/material/styles'

// third-party
import merge from 'lodash/merge'

// project import
import Autocomplete from './Autocomplete'
import Badge from './Badge'
import Button from './Button'
import Card from './Card'
import CardContent from './CardContent'
import CardHeader from './CardHeader'
import Checkbox from './Checkbox'
import Chip from './Chip'
import CssBaseline from './CssBaseline'
import DataGrid from './DataGrid'
import FormControlLabel from './FormControlLabel'
import IconButton from './IconButton'
import InputLabel from './InputLabel'
import LinearProgress from './LinearProgress'
import Link from './Link'
import ListItemIcon from './ListItemIcon'
import OutlinedInput from './OutlinedInput'
import Tab from './Tab'
import TableCell from './TableCell'
import TableHead from './TableHead'
import Tabs from './Tabs'
import Typography from './Typography'

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
    CssBaseline(theme),
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

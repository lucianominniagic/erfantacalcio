import React from 'react'
import { Button, ButtonGroup, Tooltip } from '@mui/material'
import {
  AccessAlarm,
  EmojiEvents,
  Looks3Outlined,
  Looks4Outlined,
  Looks5Outlined,
  LooksOneOutlined,
  LooksTwoOutlined,
  PendingActions,
} from '@mui/icons-material'

interface CalendarioButtonGroupProps {
  onSelect: (
    girone: number | undefined,
    isAttuale: boolean,
    onlyRecuperi: boolean,
    isChampions: boolean,
  ) => void
}

export default function CalendarioButtonGroup({
  onSelect,
}: CalendarioButtonGroupProps) {
  return (
    <ButtonGroup size="small" color="primary" aria-label="Small button group">
      <Tooltip title="Calendario partite ultimo periodo">
        <Button
          onClick={() => onSelect(undefined, true, false, false)}
          startIcon={<AccessAlarm color="error" />}
        ></Button>
      </Tooltip>
      <Tooltip title="Calendario girone 1">
        <Button
          onClick={() => onSelect(1, false, false, false)}
          startIcon={<LooksOneOutlined />}
        ></Button>
      </Tooltip>
      <Tooltip title="Calendario girone 2">
        <Button
          onClick={() => onSelect(2, false, false, false)}
          startIcon={<LooksTwoOutlined />}
        >
          &nbsp;
        </Button>
      </Tooltip>
      <Tooltip title="Calendario girone 3">
        <Button
          onClick={() => onSelect(3, false, false, false)}
          startIcon={<Looks3Outlined />}
        >
          &nbsp;
        </Button>
      </Tooltip>
      <Tooltip title="Calendario girone 4">
        <Button
          onClick={() => onSelect(4, false, false, false)}
          startIcon={<Looks4Outlined />}
        >
          &nbsp;
        </Button>
      </Tooltip>
      <Tooltip title="Calendario girone 5">
        <Button
          onClick={() => onSelect(5, false, false, false)}
          startIcon={<Looks5Outlined />}
        >
          &nbsp;
        </Button>
      </Tooltip>
      <Tooltip title="Calendario Champions">
        <Button
          onClick={() => onSelect(undefined, false, false, true)}
          startIcon={<EmojiEvents color="success" />}
        >
          &nbsp;
        </Button>
      </Tooltip>
      <Tooltip title="Partite da recuperare">
        <Button
          onClick={() => onSelect(undefined, false, true, false)}
          startIcon={<PendingActions color="action" />}
        ></Button>
      </Tooltip>
    </ButtonGroup>
  )
}

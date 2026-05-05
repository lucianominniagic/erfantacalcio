import * as React from 'react'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import { TextField, TextFieldProps, SxProps, Theme } from '@mui/material'

const filter = createFilterOptions<AutocompleteOption>()

export interface AutocompleteOption {
  id: number | string | null
  label: string
}

interface FilterParams<T> {
  inputValue: string
  getOptionLabel: (option: T) => string
}

export interface GenericAutocompleteProps<T extends AutocompleteOption> {
  /** Array of items to display in the autocomplete */
  items: T[]
  /** Callback invoked when an item is selected or text is entered */
  onItemSelected: (
    selectedId: T['id'] | undefined,
    inputValue: string | undefined,
  ) => void
  /** Label for the text field */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Size of the autocomplete */
  size?: 'small' | 'medium'
  /** Width of the autocomplete */
  width?: number | string
  /** Whether to allow free text input */
  freeSolo?: boolean
  /** Custom sx styles */
  sx?: SxProps<Theme>
  /** TextField props to pass through */
  textFieldProps?: Partial<TextFieldProps>
  /** Whether to add custom input to suggestions */
  allowCustomInput?: boolean
  /** Custom filter function */
  filterOptions?: (options: T[], params: FilterParams<T>) => T[]
  /** Disable the autocomplete */
  disabled?: boolean
  /** Loading state */
  loading?: boolean
  /** Value to control the component */
  value?: T | string | null
  /** Default value */
  defaultValue?: T | string | null
  /** Clear button visibility */
  disableClearable?: boolean
}

export default function GenericAutocomplete<T extends AutocompleteOption>({
  items,
  onItemSelected,
  label = 'Cerca',
  placeholder,
  size = 'small',
  width = 300,
  freeSolo = true,
  sx,
  textFieldProps,
  allowCustomInput = true,
  filterOptions,
  disabled = false,
  loading = false,
  value,
  defaultValue,
  disableClearable = false,
}: GenericAutocompleteProps<T>) {
  const defaultFilterOptions = React.useCallback(
    (options: T[], params: FilterParams<T>) => {
      const filtered = filter(
        options,
        params as any,
      ) as T[]

      if (
        allowCustomInput &&
        params.inputValue !== '' &&
        !items.find((item) => item.label === params.inputValue)
      ) {
        filtered.push({
          id: 0,
          label: params.inputValue,
        } as T)
      }

      return filtered
    },
    [items, allowCustomInput],
  )

  const handleChange = React.useCallback(
    (event: React.SyntheticEvent, newValue: T | string | null) => {
      if (typeof newValue === 'string') {
        // Free text input
        onItemSelected(undefined, newValue)
      } else if (
        newValue &&
        'label' in newValue &&
        (newValue.id === 0 || newValue.id === '0')
      ) {
        // Custom input suggestion
        onItemSelected(undefined, newValue.label)
      } else if (newValue && 'id' in newValue && newValue.id) {
        // Existing item selected
        onItemSelected(newValue.id, undefined)
      } else {
        // Cleared
        onItemSelected(undefined, undefined)
      }
    },
    [onItemSelected],
  )

  const getOptionLabel = React.useCallback((option: T | string) => {
    if (typeof option === 'string') {
      return option
    }
    return option.label || ''
  }, [])

  return (
    <Autocomplete<T, false, boolean, boolean>
      size={size}
      onChange={handleChange}
      filterOptions={filterOptions || defaultFilterOptions}
      options={items}
      getOptionLabel={getOptionLabel}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      freeSolo={freeSolo}
      disabled={disabled}
      loading={loading}
      value={value}
      defaultValue={defaultValue}
      disableClearable={disableClearable}
      sx={{ width, ...sx }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          {...textFieldProps}
        />
      )}
    />
  )
}

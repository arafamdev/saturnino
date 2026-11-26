import { DayPicker } from '@daypicker/react'
import { enUS } from '@daypicker/react/locale/en-US'
import { pt } from '@daypicker/react/locale/pt'

import { dateOnlyToLocalDate } from '@/lib/dates/dateOnly'

import '@daypicker/react/style.css'
import './calendar.css'

function Calendar({ locale, ...props }) {
  return (
    <DayPicker
      mode="single"
      showOutsideDays
      weekStartsOn={locale === 'pt-PT' ? 1 : 0}
      locale={locale === 'pt-PT' ? pt : enUS}
      lang={locale}
      startMonth={dateOnlyToLocalDate('0001-01-01')}
      endMonth={dateOnlyToLocalDate('9999-12-31')}
      className="saturnino-calendar"
      {...props}
    />
  )
}

export default Calendar

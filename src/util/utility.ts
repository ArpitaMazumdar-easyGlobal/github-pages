import * as moment from 'moment-timezone';
import { getNames } from 'country-list';
export function formatDate(dateString:string | Date) {
    const date = new Date(dateString);
    if(!dateString) return 'N/A'

    // Define the months array
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month}, ${year}`;
  }
export function getAllTimeZones ():string[]{
  return moment.tz.names();
}
export function convertToUTC(time: string, timeZone: string): string {
   // Convert the local time from the given time zone to UTC 
   const utcString = new Date(
    new Date(time).toLocaleString('en-US', { timeZone: timeZone })
  ).toISOString();

  return utcString;
}

export function getAllCountriesName(): string[]{
  return getNames().map(country => country.toUpperCase());
}
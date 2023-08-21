export const getTodaysDate = () => {
    const today = new Date();
    const maxDate = today.toISOString().split("T")[0];
    return maxDate
}

export const getNextDay = (dateString: string) => {
    // Parse the date string into a Date object
    const parts = dateString.split("-");
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Subtract 1 from the month because months in JavaScript are 0-indexed
    const day = parseInt(parts[2]);
    const date = new Date(year, month, day);
  
    // Add one day to the date
    date.setDate(date.getDate() + 1);
  
    // Format the result as "yyyy-mm-dd"
    const nextDay =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");
  
    return nextDay;
  }

 export  function getUniqueValuesByKey(arr:any[], key:string) {
    const uniqueValues = new Set();
  
    for (const obj of arr) {
      if (obj.hasOwnProperty(key)) {
        uniqueValues.add(obj[key]);
      }
    }
  
    // Convert the Set to an array
    return Array.from(uniqueValues);
  }
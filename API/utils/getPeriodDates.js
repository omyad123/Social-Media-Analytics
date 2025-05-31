
export const getPeriodDates = (type, value, start, end) => {
    const now = new Date();
    let startCurrent, endCurrent, startPrevious, endPrevious;
  
    switch (type) {
      case 'day': {
        startCurrent = new Date(value);
        endCurrent = new Date(startCurrent);
        endCurrent.setDate(startCurrent.getDate() + 1);
        break;
      }
  
      case 'month': {
        const [year, month] = value.split('-');
        startCurrent = new Date(year, month - 1, 1);
        endCurrent = new Date(year, month, 0, 23, 59, 59);
        break;
      }
  
      case 'year': {
        startCurrent = new Date(`${value}-01-01T00:00:00`);
        endCurrent = new Date(`${value}-12-31T23:59:59`);
        break;
      }
  
      case 'range': {
        startCurrent = new Date(start);
        endCurrent = new Date(end);
        endCurrent.setHours(23, 59, 59, 999);
        break;
      }
  
      case 'last7days': {
        endCurrent = new Date(now);
        startCurrent = new Date();
        startCurrent.setDate(endCurrent.getDate() - 6);
        break;
      }
  
      case 'last30days': {
        endCurrent = new Date(now);
        startCurrent = new Date();
        startCurrent.setDate(endCurrent.getDate() - 29);
        break;
      }
  
      case 'currentMonth': {
        const year = now.getFullYear();
        const month = now.getMonth();
        startCurrent = new Date(year, month, 1);
        endCurrent = new Date(year, month + 1, 0, 23, 59, 59);
        break;
      }
  
      default:
        throw new Error('Invalid filter type');
    }
  
    const duration = endCurrent.getTime() - startCurrent.getTime();
    startPrevious = new Date(startCurrent.getTime() - duration);
    endPrevious = new Date(startCurrent.getTime() - 1);
  
    return { startCurrent, endCurrent, startPrevious, endPrevious };
  };
  
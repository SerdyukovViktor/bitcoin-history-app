import axios from 'axios';

export async function getDBData(startDate, endDate) {
  try {
    const response = await axios.get(`http://localhost:3001/api/prices`, {
      params: {
        startDate: startDate,
        endDate: endDate
      }
    });
    const data = response.data;
    
    if (data && data.length > 0) {
      const usdData = data.filter(item => item.currency === 'USD')
      
      const gbpData = data.filter(item => item.currency === 'GBP')
      
      const eurData = data.filter(item => item.currency === 'EUR')
    
      return { usd: usdData, gbp: gbpData, eur: eurData}
    } else {
      return null;
      }
    } catch (error) {
      alert(`В базе данных отсутствуют записи за указанный период`);
      return null;
    }
  }

export async function getTodayData() {
  const today = new Date();
  const startDate = new Date(today.setUTCHours(0, 0, 0, 0)).toISOString();
  const endDate = new Date(today.setUTCHours(23, 59, 59, 999)).toISOString();
  return await getDBData(startDate, endDate);
}

export async function getWeekData() {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setUTCHours(0, 0, 0, 0);
  const startDate = weekAgo.toISOString();
  const endDate = new Date(today.setUTCHours(23, 59, 59, 999)).toISOString();
  return await getDBData(startDate, endDate);
}

export async function getMonthData() {
  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  monthAgo.setUTCHours(0, 0, 0, 0);
  const startDate = monthAgo.toISOString();
  const endDate = new Date(today.setUTCHours(23, 59, 59, 999)).toISOString();
  return await getDBData(startDate, endDate);
}

export async function getYearData() {
  const today = new Date();
  today.setUTCHours(today.getHours() + 3);
  const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate(), 24, 0, 0, 0);
  const startDate = yearAgo.toISOString();
  const endDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();
  return await getDBData(startDate, endDate);
}

export async function getCustomData(startDate, endDate) {
  if (startDate && endDate) {
    const lastDate = new Date(endDate);
    const customEndDate = new Date(lastDate.setUTCHours(23, 59, 59, 999)).toISOString();
    return await getDBData(startDate, customEndDate);
  } else {
    return null;
  }
}
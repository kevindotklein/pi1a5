import moment from "moment";

export const timeSince = (date: any) => {
  moment.locale("pt-br");

  const now = moment();
  const past = moment(date);
  const duration = moment.duration(now.diff(past));

  const years = duration.years();
  const months = duration.months();
  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  if (years > 0) {
    return `${years} ano${years > 1 ? "s" : ""}`;
  }
  if (months > 0) {
    return `${months} mês${months > 1 ? "es" : ""}`;
  }
  if (days > 0) {
    return `${days} dia${days > 1 ? "s" : ""}`;
  }
  if (hours > 0) {
    return `${hours} hora${hours > 1 ? "s" : ""}`;
  }
  if (minutes > 0) {
    return `${minutes} minuto${minutes > 1 ? "s" : ""}`;
  }
  if (seconds > 0) {
    return `${seconds} segundo${seconds > 1 ? "s" : ""}`;
  }
};

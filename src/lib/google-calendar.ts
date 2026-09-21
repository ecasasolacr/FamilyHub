import { google } from 'googleapis';

export function getGoogleAuthClient(providerToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: providerToken });
  return oauth2Client;
}

export async function fetchFamilyHubEvents(providerToken: string) {
  const auth = getGoogleAuthClient(providerToken);
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    // Get a reasonable time window to show (e.g., +/- 2 months)
    const now = new Date();
    const timeMin = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();
    const timeMax = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString();

    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      maxResults: 200,
      singleEvents: true,
      orderBy: 'startTime',
      q: '[FamilyHub]', // Search term
    });

    return res.data.items || [];
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    return [];
  }
}

export async function createGoogleCalendarEvent(
  providerToken: string,
  eventDetails: { title: string; description?: string; startTime: string; endTime: string }
) {
  const auth = getGoogleAuthClient(providerToken);
  const calendar = google.calendar({ version: 'v3', auth });

  const titleWithKeyword = eventDetails.title.includes('[FamilyHub]') 
    ? eventDetails.title 
    : `[FamilyHub] ${eventDetails.title}`;

  try {
    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: titleWithKeyword,
        description: eventDetails.description,
        start: {
          dateTime: eventDetails.startTime,
        },
        end: {
          dateTime: eventDetails.endTime,
        },
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    // Don't throw so we don't break the Supabase insertion if this fails
    return null;
  }
}

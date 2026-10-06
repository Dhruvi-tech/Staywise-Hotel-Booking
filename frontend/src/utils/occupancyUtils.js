/**
 * Room Occupancy Policy:
 * Standard Hotel Policy: 1 room accommodates a maximum of 2 adults and 1 child.
 * Total maximum capacity per room = 3 guests (max 2 adults, max 1 child).
 */

export const MAX_ADULTS_PER_ROOM = 2;
export const MAX_CHILDREN_PER_ROOM = 1;
export const MAX_GUESTS_PER_ROOM = 3;

/**
 * Calculates the minimum number of rooms required for a given number of adults and children.
 * Each room can accommodate at most 2 adults and 1 child.
 *
 * @param {number} adults - Number of adults (min 1)
 * @param {number} children - Number of children (min 0)
 * @returns {number} Minimum required rooms
 */
export const calculateRequiredRooms = (adults = 1, children = 0) => {
  const safeAdults = Math.max(1, Number(adults) || 1);
  const safeChildren = Math.max(0, Number(children) || 0);

  const roomsForAdults = Math.ceil(safeAdults / MAX_ADULTS_PER_ROOM);
  const roomsForChildren = Math.ceil(safeChildren / MAX_CHILDREN_PER_ROOM);
  const roomsForTotal = Math.ceil((safeAdults + safeChildren) / MAX_GUESTS_PER_ROOM);

  return Math.max(1, roomsForAdults, roomsForChildren, roomsForTotal);
};

/**
 * Checks if the current configuration exceeds room capacity.
 *
 * @param {number} rooms - Number of booked rooms
 * @param {number} adults - Number of adults
 * @param {number} children - Number of children
 * @returns {{
 *   isOverCapacity: boolean,
 *   requiredRooms: number,
 *   reason: string,
 *   maxAdults: number,
 *   maxChildren: number
 * }}
 */
export const checkRoomCapacity = (rooms = 1, adults = 1, children = 0) => {
  const safeRooms = Math.max(1, Number(rooms) || 1);
  const safeAdults = Math.max(1, Number(adults) || 1);
  const safeChildren = Math.max(0, Number(children) || 0);

  const maxAdults = safeRooms * MAX_ADULTS_PER_ROOM;
  const maxChildren = safeRooms * MAX_CHILDREN_PER_ROOM;
  const requiredRooms = calculateRequiredRooms(safeAdults, safeChildren);

  const isOverCapacity = safeRooms < requiredRooms;

  let reason = '';
  if (isOverCapacity) {
    if (safeAdults > maxAdults && safeChildren > maxChildren) {
      reason = `${safeRooms} ${safeRooms === 1 ? 'room' : 'rooms'} can accommodate up to ${maxAdults} adults and ${maxChildren} ${maxChildren === 1 ? 'child' : 'children'}. You have ${safeAdults} adults and ${safeChildren} children.`;
    } else if (safeAdults > maxAdults) {
      reason = `${safeRooms} ${safeRooms === 1 ? 'room' : 'rooms'} can accommodate up to ${maxAdults} adults (max 2 adults per room). You have selected ${safeAdults} adults.`;
    } else if (safeChildren > maxChildren) {
      reason = `${safeRooms} ${safeRooms === 1 ? 'room' : 'rooms'} can accommodate up to ${maxChildren} ${maxChildren === 1 ? 'child' : 'children'} (max 1 child per room). You have selected ${safeChildren} children.`;
    } else {
      reason = `${safeRooms} ${safeRooms === 1 ? 'room' : 'rooms'} cannot accommodate ${safeAdults + safeChildren} guests.`;
    }
  }

  return {
    isOverCapacity,
    requiredRooms,
    maxAdults,
    maxChildren,
    reason
  };
};

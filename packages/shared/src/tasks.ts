import type { PhotoKind, ServiceKey, TaskSelectionInput } from "./types";

/** "after" = an after photo is required; "pair" = before and after are required. */
export type PhotoRequirement = "after" | "pair" | null;

export interface CatalogueTask {
  key: string;
  room: string;
  name: string;
  photo: PhotoRequirement;
}

export interface ServiceCatalogue {
  service: ServiceKey;
  name: string;
  /** Most tasks a customer can have on one booking, including their own. */
  maxTasks: number;
  rooms: Record<string, [name: string, photo?: PhotoRequirement][]>;
  notIncluded: string[];
}

const regular: ServiceCatalogue = {
  service: "regular",
  name: "Regular home clean",
  maxTasks: 20,
  rooms: {
    Kitchen: [["Clean worktops and hob", "after"], ["Clean sink and taps"], ["Wipe cupboard fronts"], ["Wipe outside of appliances"], ["Empty bins and replace liners"], ["Mop floor"]],
    Bathroom: [["Clean toilet"], ["Clean shower, bath and screen", "pair"], ["Clean basin and taps"], ["Wipe mirrors and tiles"], ["Mop floor"]],
    "Living areas": [["Dust reachable surfaces"], ["Vacuum floors and rugs"], ["Tidy and plump cushions"]],
    Bedrooms: [["Dust surfaces"], ["Vacuum floors"], ["Make beds (change linen if left out)"]],
  },
  notIncluded: ["Inside oven or fridge (available as add-ons)", "Exterior windows", "Moving heavy furniture", "Biohazard or clinical waste"],
};

const deep: ServiceCatalogue = {
  service: "deep",
  name: "Deep clean",
  maxTasks: 32,
  rooms: {
    Kitchen: [["Degrease worktops and hob", "after"], ["Descale sink and taps"], ["Clean inside cupboards (emptied)"], ["Wipe cupboard fronts and handles"], ["Clean behind movable appliances"], ["Wipe outside of appliances"], ["Scrub tiles and splashback grout"], ["Wipe skirting boards"], ["Empty, wash and reline bins"], ["Mop floor, edges included"]],
    Bathroom: [["Clean toilet, including the base", "after"], ["Descale shower head and taps"], ["Remove limescale from shower screen", "pair"], ["Clean bath and basin"], ["Scrub tiles and grout"], ["Polish mirrors"], ["Clean extractor fan cover"], ["Mop floor"]],
    "Living areas": [["Dust high and low, including light fittings"], ["Wipe skirting boards and door frames"], ["Clean door handles and light switches"], ["Vacuum under and behind furniture"], ["Wipe windowsills"], ["Vacuum sofa and cushions"]],
    Bedrooms: [["Dust all surfaces"], ["Vacuum under beds"], ["Wipe skirting boards"], ["Wipe wardrobe fronts"]],
  },
  notIncluded: ["Carpet shampoo", "Exterior windows", "Post-construction dust", "Biohazard or clinical waste"],
};

const eot: ServiceCatalogue = {
  service: "eot",
  name: "End of tenancy clean",
  maxTasks: 36,
  rooms: {
    ...deep.rooms,
    Kitchen: [...deep.rooms.Kitchen, ["Clean inside oven", "pair"], ["Clean inside fridge and freezer", "after"]],
    "Living areas": [...deep.rooms["Living areas"], ["Clean interior windows"]],
    Bedrooms: [...deep.rooms.Bedrooms, ["Clean inside wardrobes and drawers"]],
  },
  notIncluded: ["Carpet steam cleaning (add-on)", "Exterior windows", "Removing rubbish or belongings", "Pest or mould treatment"],
};

export const SERVICE_CATALOGUES: Record<ServiceKey, ServiceCatalogue> = { regular, deep, eot };

export const taskKey = (room: string, name: string) => `${room}|${name}`;

export function catalogueTasks(service: ServiceKey): CatalogueTask[] {
  const c = SERVICE_CATALOGUES[service];
  return Object.entries(c.rooms).flatMap(([room, list]) =>
    list.map(([name, photo]) => ({ key: taskKey(room, name), room, name, photo: photo ?? null })),
  );
}

export interface BookedTask {
  room: string;
  name: string;
  photo: PhotoRequirement;
  custom: boolean;
}

export class TaskSelectionError extends Error {}

/**
 * Turns a customer's choices into the task list frozen on the booking.
 * Every catalogue task is included unless removed; customer tasks are added
 * after them. Throws if the total is empty or above the service maximum.
 */
export function buildTaskList(sel: TaskSelectionInput, photosAllowed: boolean): BookedTask[] {
  const cat = SERVICE_CATALOGUES[sel.service];
  if (!cat) throw new TaskSelectionError(`Unknown service: ${sel.service}`);
  const removed = new Set(sel.removed);
  const rooms = new Set(Object.keys(cat.rooms));
  const base = catalogueTasks(sel.service).filter((t) => !removed.has(t.key));
  const seen = new Set(base.map((t) => t.key.toLowerCase()));
  const custom: BookedTask[] = [];
  for (const c of sel.custom) {
    const name = c.name.trim();
    if (name.length < 3) throw new TaskSelectionError("Each of your own tasks needs at least 3 characters.");
    if (!rooms.has(c.room) && c.room !== "Other") throw new TaskSelectionError(`Unknown room: ${c.room}`);
    const k = taskKey(c.room, name).toLowerCase();
    if (seen.has(k)) throw new TaskSelectionError(`"${name}" is already on the list.`);
    seen.add(k);
    custom.push({ room: c.room, name, photo: null, custom: true });
  }
  const list: BookedTask[] = [
    ...base.map((t) => ({ room: t.room, name: t.name, photo: photosAllowed ? t.photo : null, custom: false })),
    ...custom,
  ];
  if (list.length === 0) throw new TaskSelectionError("Choose at least one task.");
  if (list.length > cat.maxTasks) throw new TaskSelectionError(`You can have up to ${cat.maxTasks} tasks for a ${cat.name.toLowerCase()}.`);
  return list;
}

export function requiredPhotoKinds(photo: PhotoRequirement): PhotoKind[] {
  return photo === "pair" ? ["before", "after"] : photo === "after" ? ["after"] : [];
}

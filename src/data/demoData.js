import { daysAgo, daysAgoStr } from "../lib/dateUtils";
import { PALETTE } from "../styles/dashboardTheme";

let idCounter = 0;
const nid = (prefix) => `${prefix}_${(idCounter++).toString(36)}`;

function mkEntry(dayOffset, hour, minute, duration) {
  const d = daysAgo(dayOffset);
  d.setHours(hour, minute, 0, 0);
  return { id: nid("e"), duration, timestamp: d.toISOString() };
}

function buildDemoData() {
  const cat = (name, color, subs) => ({ id: nid("c"), name, color, subcategories: subs });
  const sub = (name, tasks) => ({ id: nid("s"), name, tasks });
  const task = (name, estMinutes, status, dayOffset, entries) => ({
    id: nid("t"), name, estMinutes, status, date: daysAgoStr(dayOffset), entries,
  });

  return [
    cat("Work", PALETTE[0], [
      sub("Client Calls", [
        ...Array.from({ length: 13 }, (_, i) => 12 - i).map((offset) =>
          task("Daily standup", 15, "Completed", offset, [mkEntry(offset, 9, 0, 15)])
        ),
        task("Q3 sync with Acme Corp", 45, "Completed", 2, [mkEntry(2, 9, 15, 50)]),
        task("Vendor negotiation call", 30, "Pending", 12, []),
        task("Quarterly review", 60, "Completed", 24, [mkEntry(24, 10, 30, 65)]),
        task("Client feedback session", 35, "In Progress", 48, [mkEntry(48, 14, 0, 25)]),
      ]),
      sub("Coding", [
        task("Deep work block", 60, "Completed", 1, [mkEntry(1, 10, 30, 70)]),
        task("Fix dashboard bug", 90, "In Progress", 0, [mkEntry(0, 14, 0, 55)]),
        task("Code review PR#221", 30, "Pending", 7, []),
        task("Refactor auth module", 120, "Pending", 21, []),
        task("Ship release notes", 45, "Completed", 35, [mkEntry(35, 15, 20, 48)]),
      ]),
    ]),
    cat("Study", PALETTE[1], [
      sub("Reading", [
        task("Read ML paper", 60, "Completed", 0, [mkEntry(0, 8, 0, 55)]),
        task("Finish chapter 5", 45, "Pending", 9, []),
        task("Review design systems", 50, "Completed", 30, [mkEntry(30, 19, 0, 52)]),
      ]),
      sub("Practice", [
        task("LeetCode practice", 30, "In Progress", 0, [mkEntry(0, 16, 0, 20)]),
        task("Mock interview prep", 40, "Pending", 18, []),
        task("Frontend interview drills", 25, "Completed", 45, [mkEntry(45, 20, 0, 27)]),
      ]),
    ]),
    cat("Health", PALETTE[2], [
      sub("Exercise", [
        ...Array.from({ length: 10 }, (_, i) => 9 - i).map((offset) =>
          offset === 3
            ? task("Morning run / workout", 30, "Pending", offset, [])
            : task("Morning run / workout", 30, "Completed", offset, [mkEntry(offset, 6, 45, 32)])
        ),
        task("Yoga session", 20, "Pending", 5, []),
        task("Pilates class", 35, "Completed", 31, [mkEntry(31, 7, 0, 36)]),
      ]),
      sub("Nutrition", [
        task("Meal prep", 40, "Pending", 3, []),
        task("Grocery run", 25, "Pending", 20, []),
        task("Hydration habit tracker", 15, "Completed", 54, [mkEntry(54, 8, 30, 16)]),
      ]),
    ]),
    cat("Personal", PALETTE[3], [
      sub("Planning", [
        task("Plan the week", 20, "Completed", 4, [mkEntry(4, 21, 0, 22)]),
        task("Budget review", 40, "Pending", 14, []),
        task("Monthly review", 35, "Completed", 34, [mkEntry(34, 20, 45, 37)]),
      ]),
      sub("Errands", [
        task("Book doctor appointment", 25, "Completed", 27, [mkEntry(27, 12, 0, 24)]),
        task("Pick up parcel", 15, "Pending", 63, []),
        task("Car service appointment", 45, "In Progress", 68, [mkEntry(68, 11, 30, 28)]),
      ]),
    ]),
    cat("Learning", PALETTE[4], [
      sub("Courses", [
        task("React refresher", 90, "Completed", 6, [mkEntry(6, 20, 0, 95)]),
        task("Data visualization lesson", 60, "Pending", 16, []),
        task("UI design principles", 75, "Completed", 41, [mkEntry(41, 19, 15, 78)]),
      ]),
      sub("Reading", [
        task("Read productivity book", 50, "In Progress", 22, [mkEntry(22, 21, 30, 35)]),
        task("Summary notes", 30, "Pending", 51, []),
        task("Watch coding tutorial", 45, "Completed", 77, [mkEntry(77, 18, 0, 42)]),
      ]),
    ]),
  ];
}

export function buildDemoDataFinal() {
  return buildDemoData();
}

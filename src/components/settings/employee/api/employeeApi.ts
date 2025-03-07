
import { Employee } from "../types";
import { fetchEmployeeProfiles } from "./employeeQueries";
import { fetchUserPelakuUsaha } from "./businessQueries";
import { mapEmployeeData } from "./employeeMappers";

/**
 * Fetch all employees for a given pelaku usaha and branch (if specified)
 */
export async function fetchEmployees(pelakuUsahaId: number, cabangId?: number) {
  console.log("Fetching employees for pelaku usaha ID:", pelakuUsahaId, "and cabang ID:", cabangId);
  
  if (!pelakuUsahaId) {
    console.error("Invalid pelakuUsahaId:", pelakuUsahaId);
    throw new Error("ID pelaku usaha tidak valid");
  }
  
  // Get profiles data
  const profileData = await fetchEmployeeProfiles(pelakuUsahaId, cabangId);
  console.log("Employee profiles data:", profileData);

  // Map profile data to employee format
  const employeeData = mapEmployeeData(profileData, pelakuUsahaId);
  console.log("Mapped employee data:", employeeData);
  
  return employeeData;
}

// Re-export the functions from businessQueries
export { fetchUserPelakuUsaha };

// Re-export the functions from employeeMappers
export { mapEmployeeData };

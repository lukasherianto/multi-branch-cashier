
import { Employee } from "../types";
import { fetchEmployeeProfiles, fetchKaryawanData } from "./employeeQueries";
import { fetchUserPelakuUsaha } from "./businessQueries";
import { combineEmployeeData, mapEmployeeData } from "./employeeMappers";

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

  // Get karyawan data
  const karyawanData = await fetchKaryawanData(pelakuUsahaId, cabangId);
  console.log("Karyawan data:", karyawanData);

  // Combine the data from both sources
  const combinedData = combineEmployeeData(profileData, karyawanData, pelakuUsahaId);
  console.log("Combined employee data:", combinedData);
  
  return combinedData;
}

// Re-export the functions from businessQueries
export { fetchUserPelakuUsaha };

// Re-export the functions from employeeMappers
export { mapEmployeeData };

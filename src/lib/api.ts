export async function deleteFolder(user_id: string, property_uuid: string) {
  const res = await fetch(
    `http://localhost:5000/delete_folder?user_id=${user_id}&property_uuid=${property_uuid}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete folder");
  }

  return res.json();
}

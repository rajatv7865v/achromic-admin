let mockMagazines: any[] = [];

export async function getMagazines() {
  return {
    data: {
      data: mockMagazines,
    },
  };
}

export async function createMagazine(data: any) {
  const magazineWithId = { id: Date.now(), ...data };
  mockMagazines = [...mockMagazines, magazineWithId];

  return {
    data: {
      data: magazineWithId,
    },
  };
}



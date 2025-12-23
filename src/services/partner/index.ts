let mockPartners: any[] = [];

export async function createPartner(data: any) {
  const partnerWithId = { id: Date.now(), ...data };
  mockPartners = [...mockPartners, partnerWithId];

  return {
    data: {
      data: partnerWithId,
    },
  };
}



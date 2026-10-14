import type { ITempatRepository } from '../../interfaces/ITempatRepository';
import type {
  Tempat,
  TempatFilterParams,
  CreateTempatInput,
  UpdateTempatInput,
  Ruangan,
  CreateRuanganInput,
  UpdateRuanganInput,
  DeleteMasterResult,
} from '../../types/master';
import {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
  getAllRooms,
  getRoomsByPlace,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../../api/generated/endpoints';
import type {
  PlaceDto,
  RoomDto,
  DeleteResultDto,
} from '../../api/generated/models';
import {
  mapPlaceDtoToTempat,
  mapRoomDtoToRuangan,
  mapDeleteResultDto,
} from '../mappers/masterMapper';

export class HttpTempatRepository implements ITempatRepository {
  async getAll(filter: TempatFilterParams = {}): Promise<Tempat[]> {
    const { q } = filter;
    const params = q?.trim() ? { q: q.trim() } : undefined;

    const res = await getPlaces(params);
    return ((res.data as PlaceDto[]) || []).map(mapPlaceDtoToTempat);
  }

  async getById(id: string): Promise<Tempat> {
    const res = await getPlaceById(id);
    return mapPlaceDtoToTempat(res.data as PlaceDto);
  }

  async create(input: CreateTempatInput): Promise<Tempat> {
    const res = await createPlace({
      id: null,
      name: input.nama,
    });
    return mapPlaceDtoToTempat(res.data as PlaceDto);
  }

  async update(id: string, input: UpdateTempatInput): Promise<Tempat> {
    const res = await updatePlace(id, {
      name: input.nama,
    });
    return mapPlaceDtoToTempat(res.data as PlaceDto);
  }

  async delete(id: string): Promise<DeleteMasterResult> {
    const res = await deletePlace(id);
    return mapDeleteResultDto(res.data as DeleteResultDto);
  }

  // Ruangan child resources
  async getAllRuangan(): Promise<Ruangan[]> {
    const res = await getAllRooms();
    return ((res.data as RoomDto[]) || []).map(mapRoomDtoToRuangan);
  }

  async getRuanganByTempat(tempatId: string): Promise<Ruangan[]> {
    const res = await getRoomsByPlace(tempatId);
    return ((res.data as RoomDto[]) || []).map(mapRoomDtoToRuangan);
  }

  async createRuangan(input: CreateRuanganInput): Promise<Ruangan> {
    const res = await createRoom({
      id: null,
      placeId: input.tempat,
      name: input.nama,
      capacity: input.kapasitas ?? null,
    });
    return mapRoomDtoToRuangan(res.data as RoomDto);
  }

  async updateRuangan(id: string, input: UpdateRuanganInput): Promise<Ruangan> {
    const res = await updateRoom(id, {
      name: input.nama ?? null,
      capacity: input.kapasitas ?? null,
    });
    return mapRoomDtoToRuangan(res.data as RoomDto);
  }

  async deleteRuangan(id: string): Promise<DeleteMasterResult> {
    const res = await deleteRoom(id);
    return mapDeleteResultDto(res.data as DeleteResultDto);
  }
}

import { UmbralesAtributos, UserAtributos } from "../interfaces/user.interface";
import Umbral from "../models/umbrales.model";
import User from "../models/users.model";

class UserRepository {
  async salvar(user: UserAtributos): Promise<User> {
    try {
      return await User.create({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        activo: user.activo,
        umbrals: user.umbrales,
      }, {
        include: [Umbral]
      });
    } catch (err) {
      throw new Error("Failed to create User!");
    }
  }

  async obtenerUsuariosActivos(): Promise<User[]> {
    try {
      return await User.findAll({ where: { activo: true }, include: [Umbral] });
    } catch (error) {
      throw new Error("Failed to retrieve Users!");
    }
  }

  async obtenerUsuarioPorId(id: number): Promise<User | null> {
    try {
      return await User.findByPk(id, { include: [Umbral] });
    } catch (error) {
      throw new Error("Failed to retrieve User!");
    }
  }

  async encontrarCrearUsuario (id: number, defaultUserConfig: UserAtributos): Promise<[User, boolean]> {
    try {
      console.log(id);
      console.log(defaultUserConfig);
            
      const [usuario, creado] = await User.findOrCreate({
        where: { id: id },
        defaults: {
          first_name: defaultUserConfig.first_name,
          last_name: defaultUserConfig.last_name,
          username: defaultUserConfig.username,
          activo: defaultUserConfig.activo,
        },
      })

      if(!creado)
        await this.actualizarEstadoUsuario(id, true);

      return await Umbral.bulkCreate<UmbralesAtributos>(defaultUserConfig.umbrales)

    } catch (error) {
      throw new Error("Failed to retrieve User!");
    }
  }

  async actualizarEstadoUsuario(id: number, estado: boolean): Promise<number> {
    try {
      const afectedRows = await User.update({activo: estado}, {where: {id}});
      return afectedRows[0];
    } catch (error) {
      throw new Error("Failed to retrieve User!");
    }
  }


}

export default new UserRepository();

import { pool } from "../database/connectdb.js";

export const getSimulator = async (req, res) => {
  try {
    const response = await pool.query(
      "select portfolio_user.id, position_type, portfolio_user.ticker, qyt, entry_date, entry_price, close, (CASE WHEN position_type = $2 THEN cast ( 100 * (close - entry_price) / NULLIF (entry_price,0) as decimal (20,2)) WHEN position_type = $3 THEN cast ( -100 * (close - entry_price) / NULLIF (entry_price,0) as decimal (20,2)) END ) profit_loss, total_stock_grade, sector, industry, sub_industry, volume, preassure_daily, signal_cp, alert_cp, _5_days_presion, _10_days_presion, _20_days_presion, signal_mp, alert_mp, _50_days_presion, _100_days_presion, signal_lp, alert_lp, _200_days_presion, eps_date, quarter, surprise_percentage, ytd_var_percentage, var_price_high from web_financial.portfolio_user LEFT OUTER JOIN (SELECT DISTINCT ON (ticker) * FROM web_financial.listado_historico_general  where date is not null ORDER BY ticker, date DESC) diario ON diario.ticker = web_financial.portfolio_user.ticker where uid = $1 ",
      [req.uid, "LONG", "SHORT"]
    );
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

export const getTicker = async (req, res) => {
  try {
    const { ticker } = req.body;

    let response = await pool.query(
      "SELECT * FROM web_financial.tos_sector_matrix where ticker like $1 or company_name like $1 ",
      ["%" + ticker + "%"]
    );
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

export const getPrice = async (req, res) => {
  try {
    const { ticker } = req.body;

    let response = await pool.query(
      "SELECT DISTINCT ON (ticker) close FROM web_financial.listado_historico_general where ticker = $1 ORDER BY ticker, date DESC  ",
      [ticker]
    );
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

export const getDate = async (req, res) => {
  try {
    const { ticker } = req.body;

    let response = await pool.query(
      "SELECT DISTINCT ON (ticker) date FROM web_financial.listado_historico_general where ticker = $1 ORDER BY ticker, date DESC  ",
      [ticker]
    );
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await pool.query(
      "SELECT * FROM web_financial.users WHERE email = $1 ",
      [email]
    );
    if (!user.rows[0])
      return res.status(403).json({ error: "No existe este usuario" });

    const respuestaPassword = await bcryptjs.compare(
      password,
      user.rows[0].password
    );

    if (!respuestaPassword)
      return res.status(403).json({ error: "Contraseña incorrecta" });

    //Generar el token
    const { token, expiresIn } = generateToken(user.rows[0].id);

    generateRefreshToken(user.rows[0].id, res);

    return res.json({ id: user.rows[0].id, token, expiresIn });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

export const createPosition = async (req, res) => {
  try {
    let { ticker, entry_date, entry_price, position_type, qyt } = req.body;

    if (position_type === "SHORT") {
      qyt = -qyt;
    }
    await pool.query(
      "INSERT INTO web_financial.portfolio_user ( uid, ticker, entry_date, entry_price, position_type, qyt ) VALUES ($1, $2, $3, $4, $5, $6)",
      [req.uid, ticker, entry_date, entry_price, position_type, qyt]
    );

    return res
      .status(201)
      .json({ ticker, entry_date, entry_price, position_type, qyt });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

/* export const createLink = async (req, res) => {
    try {

        let { longLink } = req.body;

        const link = new Link({ longLink, nanoLink: nanoid(6), uid: req.uid });
        const newLink = await link.save();

        return res.status(201).json({ newLink })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de servidor" })
    }
} */

//corregir el uid, para que lo tome automaticamente

export const removePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const position = await pool.query(
      "SELECT * FROM web_financial.portfolio_user WHERE id = $1 ",
      [id]
    );

    if (!position.rows[0])
      return res.status(404).json({ error: "No existe el ticker" });

    const respuestaPassword = (await position.rows[0].uid) === req.uid;

    if (!respuestaPassword)
      return res.status(401).json({ error: "No le pertenece esa position" });

    await pool.query(
      "DELETE FROM web_financial.portfolio_user WHERE id = $1 ",
      [id]
    );

    return res.json({ position });
  } catch (error) {
    console.log(error);
    if (error.kind === "ObjectId") {
      return res.status(403).json({ error: "Formato id Incorrecto" });
    }
    return res.status(500).json({ error: "error de servidor" });
  }
};

export const updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    let { entry_date, entry_price, position_type, qyt } = req.body;

    if (position_type === "SHORT") {
      qyt = -qyt;
    }

    const position = await pool.query(
      "SELECT * FROM web_financial.portfolio_user WHERE id = $1 ",
      [id]
    );

    if (!position.rows[0])
      return res.status(404).json({ error: "No existe el ticker" });

    const respuestaPassword = (await position.rows[0].uid) === req.uid;

    if (!respuestaPassword)
      return res.status(401).json({ error: "No le pertenece esa position" });

    await pool.query(
      "UPDATE web_financial.portfolio_user SET entry_date = $2, entry_price = $3, position_type= $4, qyt= $5 WHERE id = $1 ",
      [id, entry_date, entry_price, position_type, qyt]
    );

    return res.json({ position });
  } catch (error) {
    console.log(error);
    if (error.kind === "ObjectId") {
      return res.status(403).json({ error: "Formato id Incorrecto" });
    }
    return res.status(500).json({ error: "error de servidor" });
  }
};

export const createPortafolio = async (req, res) => {
  try {
    const tickers = req.body.tickers;
    const nombreLista = req.body.nombreLista;

    // Convertir la lista de tickers en una cadena separada por comas
    const tickersString = tickers.join(", ");

    const insertQuery =
      "INSERT INTO web_financial.listas_simuladores (tickers, nombre_lista) VALUES ($1, $2) RETURNING *";
    const insertValues = [tickersString, nombreLista];

    // Insertar el portafolio en la base de datos y obtener el registro recién insertado
    const {
      rows: [createdPortafolio],
    } = await pool.query(insertQuery, insertValues);

    return res.json({
      message: "Portafolio creado exitosamente",
      portafolio: createdPortafolio,
    });
  } catch (error) {
    console.error("Error al guardar los datos:", error);
    return res.status(500).json({ error: "Error al guardar los datos" });
  }
};

export const getPortafolios = async (req, res) => {
  try {
    const response = await pool.query(
      "select * FROM web_financial.listas_simuladores"
    );
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

export const deletePortafolio = async (req, res) => {
  try {
    const nombreLista = req.body.nombreLista;
    await pool.query(
      "DELETE FROM web_financial.listas_simuladores WHERE nombre_lista = $1 ",
      [nombreLista]
    );

    return res.json({ nombreLista });
  } catch (error) {
    console.error("Error al eliminar los datos:", error);
    return res.status(500).json({ error: "Error al eliminar los datos" });
  }
};

export const updateAcciones = async (req, res) => {
  try {
    const id = req.params.id;
    const tickers = req.body.tickers; // Array de tickers actualizado

    await pool.query(
      "UPDATE web_financial.listas_simuladores SET tickers = $1 WHERE id = $2",
      [tickers, id]
    );

    return res.json({
      message: "Acciones actualizadAs exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar las acciones y nombre de lista:", error);
    return res
      .status(500)
      .json({ error: "Error al actualizar las acciones y nombre de lista" });
  }
};

export const updateNombreLista = async (req, res) => {
  try {
    const id = req.params.id;
    const nombreLista = req.body.nombreLista; // Nuevo nombre de la lista

    await pool.query(
      "UPDATE web_financial.listas_simuladores SET nombre_lista = $1 WHERE id = $2",
      [nombreLista, id]
    );

    return res.json({
      message: "Nombre de lista actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar el nombre de lista:", error);
    return res
      .status(500)
      .json({ error: "Error al actualizar el nombre de lista" });
  }
};

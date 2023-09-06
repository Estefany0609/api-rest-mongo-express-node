import { pool } from "../database/connectdb.js";
import { sendMail } from "../utils/mailer.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import moment from "moment";

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
    const email = req.body.email;
    // Convertir la lista de tickers en una cadena separada por comas
    const tickersString = tickers.join(", ");

    const insertQuery =
      "INSERT INTO web_financial.listas_simuladores (tickers, nombre_lista, email) VALUES ($1, $2 , $3) RETURNING *";
    const insertValues = [tickersString, nombreLista, email];

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
      "select * FROM web_financial.listas_simuladores ORDER BY nombre_lista"
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

async function sendMailAsync(mailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
}

export const getAlertasPortafolios = async (req, res) => {
  try {
    // 1. Obtener todas las listas de tickers de la tabla listas_simuladores
    const listasResponse = await pool.query(
      "SELECT id, tickers, nombre_lista, email FROM web_financial.listas_simuladores where email is not null"
    );

    if (!listasResponse.rows || listasResponse.rows.length === 0)
      throw { code: 11000 };

    // Aquí verificamos si el parámetro date está presente, de lo contrario, utilizamos la fecha actual.

    const getNewYorkDate = () => {
      const newYorkTime = moment().tz("America/New_York");
      return newYorkTime.format("YYYY-MM-DD");
    };

    const dateFromParams = req.params.date;
    const today = dateFromParams ? dateFromParams : getNewYorkDate();

    console.log(today);
    let mensajes = [];
    let mensajesPorEmail = {};
    let mensajesGenerales = [];

    const generalAlertsQuery = `
    SELECT macd.ticker, signal_alert
    FROM web_financial.h_p_macd_mp macd
    LEFT OUTER JOIN web_financial.fundamental_criteria ON web_financial.fundamental_criteria.ticker = macd.ticker
    LEFT OUTER JOIN (SELECT DISTINCT ON (ticker) * FROM web_financial.tos_eps where date is not null
    ORDER BY ticker, date DESC) eps ON eps.ticker = macd.ticker
    WHERE macd.date = $1 AND (total_stock_grade = 'EXCELLENT' OR total_stock_grade = 'GOOD' ) AND correlation > 0.6
    AND signal_alert = 'Señal de Compra'
`;
    const generalAlertsQueryCompra = `
    SELECT ticker, (preassure_daily*0.05) +(_5_days_presion*0.1)+(_10_days_presion*0.15)+(_20_days_presion*0.25)+(_50_days_presion*0.25)+(_100_days_presion*0.1)+(_200_days_presion*0.07)+(_260_days_presion*0.03) presion_volumen_mediano 
	  FROM web_financial.listado_historico_general 
	  WHERE date = $1 AND signal_alert_mp = 'Señal de Compra' AND  (signal_alert_cp = 'Compra' OR signal_alert_cp = 'Señal de Compra')
	  AND (total_stock_grade = 'EXC' OR total_stock_grade = 'GD' ) AND correlation > 0.6 AND (preassure_daily*0.05 + _5_days_presion*0.1 + _10_days_presion*0.15 + _20_days_presion*0.25 + _50_days_presion*0.25 + _100_days_presion*0.1 + _200_days_presion*0.07 + _260_days_presion*0.03) > 0
	  ORDER BY presion_volumen_mediano DESC LIMIT 5
`;
    const generalAlertsQueryVenta = `
    SELECT ticker, (preassure_daily*0.05) +(_5_days_presion*0.1)+(_10_days_presion*0.15)+(_20_days_presion*0.25)+(_50_days_presion*0.25)+(_100_days_presion*0.1)+(_200_days_presion*0.07)+(_260_days_presion*0.03) presion_volumen_mediano 
	  FROM web_financial.listado_historico_general 
	  WHERE date = $1 AND signal_alert_mp = 'Señal de Venta' AND  (signal_alert_cp = 'Venta' OR signal_alert_cp = 'Señal de Venta')
	  AND (total_stock_grade = 'RG-' OR total_stock_grade = 'BAD' ) AND correlation < 0.4 AND (preassure_daily*0.05 + _5_days_presion*0.1 + _10_days_presion*0.15 + _20_days_presion*0.25 + _50_days_presion*0.25 + _100_days_presion*0.1 + _200_days_presion*0.07 + _260_days_presion*0.03) < 0
	  ORDER BY presion_volumen_mediano ASC LIMIT 5
`;

    const generalAlertsQueryYellow = `
    SELECT ticker, (preassure_daily*0.05) +(_5_days_presion*0.1)+(_10_days_presion*0.15)+(_20_days_presion*0.25)+(_50_days_presion*0.25)+(_100_days_presion*0.1)+(_200_days_presion*0.07)+(_260_days_presion*0.03) presion_volumen_mediano 
	  FROM web_financial.listado_historico_general 
	  WHERE date = $1 AND signal_alert_mp = 'Alerta Yellow' AND  (signal_alert_cp = 'Venta' OR signal_alert_cp = 'Señal de Venta' OR signal_alert_cp = 'Alerta Yellow')
	  AND (total_stock_grade = 'EXC' OR total_stock_grade = 'GD' ) AND correlation > 0.6 AND (preassure_daily*0.05 + _5_days_presion*0.1 + _10_days_presion*0.15 + _20_days_presion*0.25 + _50_days_presion*0.25 + _100_days_presion*0.1 + _200_days_presion*0.07 + _260_days_presion*0.03) < 0
	  ORDER BY presion_volumen_mediano ASC LIMIT 5
`;

    /* AND(signal_alert = 'Señal de Compra' OR signal_alert = 'Señal de Venta' OR signal_alert = 'Alerta Yellow') */

    /* const generalAlertsCompraResponse = await pool.query(
      generalAlertsQueryCompra,
      [today]
    );
    const generalAlertsVentaResponse = await pool.query(
      generalAlertsQueryVenta,
      [today]
    );
    const generalAlertsYellowResponse = await pool.query(
      generalAlertsQueryYellow,
      [today]
    ); */

    let generalCompras = [];
    let generalVentas = [];
    let generalYellow = [];

    let getLimitedList = (arr) => {
      if (arr.length <= 5) return arr.join(", ");
      return arr.slice(0, 5).join(", ") /* + " y más..." */;
    };

    /* for (let alerta of generalAlertsResponse.rows) {
      if (alerta.signal_alert === "Señal de Compra") {
        generalCompras.push(alerta.ticker);
      } else if (alerta.signal_alert === "Señal de Venta") {
        generalVentas.push(alerta.ticker);
      } else {
        generalYellow.push(alerta.ticker);
      }
    }   */

    // Procesar las respuestas de compra
    /*  for (let alerta of generalAlertsCompraResponse.rows) {
      generalCompras.push(alerta.ticker);
    }

    // Procesar las respuestas de venta
    for (let alerta of generalAlertsVentaResponse.rows) {
      generalVentas.push(alerta.ticker);
    }

    // Procesar las respuestas de alerta yellow
    for (let alerta of generalAlertsYellowResponse.rows) {
      generalYellow.push(alerta.ticker);
    } */

    if (generalCompras.length > 0 || generalVentas.length > 0) {
      let generalMensaje = `<hr><p style="text-align: justify;">El servicio que a continuación se presenta destaca una selección exclusiva de 5 acciones para cada tipo de alerta. Esta selección se origina a partir de la aplicación meticulosa de diversos filtros y características específicas, diseñados para proporcionar una visión clara y objetiva de los movimientos del mercado.</p>`;

      if (generalCompras.length > 0) {
        generalMensaje += `<p>Acciones con fundamentos económicos excelentes que el día de hoy dieron señal de compra a mediano plazo:</p>`;
        generalMensaje += `<div class="alert buy"><span style="color: green; font-weight: bold; text-decoration: underline;">Señal de Compra:</span> ${getLimitedList(
          generalCompras
        )}</div>`;
      }
      if (generalVentas.length > 0) {
        generalMensaje += `<p>Acciones con fundamentos económicos regulares y malos que el día de hoy dieron señal de venta a mediano plazo:</p>`;
        generalMensaje += `<div class="alert sell"><span style="color: red; font-weight: bold; text-decoration: underline;">Señal de Venta:</span> ${getLimitedList(
          generalVentas
        )}</div>`;
      }
      if (generalYellow.length > 0) {
        generalMensaje += `<p>Acciones que a pesar de poseer fundamentos económicos de carácter regular a bajo, han emitido hoy una 'Alerta Yellow' a mediano plazo. Esto sugiere la posibilidad de una futura señal de venta:</p>`;
        generalMensaje += `<div class="alert yellow"><span style="font-weight: bold; text-decoration: underline;">Alerta Yellow:</span> ${getLimitedList(
          generalYellow
        )}</div>`;
      }

      generalMensaje += `
<p>Para un análisis más detallado de las señales y alertas, le animamos a visitar nuestro sitio web en <a href="https://ldms.vercel.app/">LDMS</a>, específicamente en la sección de filtros. Allí podrá interactuar y examinar los variados escenarios disponibles.</p>
<p>Estamos comprometidos en proporcionarle herramientas precisas y actualizadas para ayudarle en sus decisiones de inversión.</p>
<p>Atentamente,</p>
<p>El equipo de LDMS</p>
`;

      mensajesGenerales.push(generalMensaje);
    }
    // 2. Iterar sobre cada lista y buscar alertas
    for (let lista of listasResponse.rows) {
      const tickersArray = lista.tickers
        .split(", ")
        .map((ticker) => `'${ticker.trim()}'`);
      const tickersForQuery = tickersArray.join(",");

      // Consulta de alertas para la lista actual
      const alertsQuery = `
                SELECT ticker, signal_alert 
                FROM web_financial.h_p_macd_mp 
                WHERE date = $1 
                AND (signal_alert = 'Señal de Compra' OR signal_alert = 'Señal de Venta' OR signal_alert = 'Alerta Yellow')
                AND ticker IN (${tickersForQuery})
            `;
      const alertsResponse = await pool.query(alertsQuery, [today]);

      // Preparar el mensaje para esta lista
      let compras = [];
      let ventas = [];
      let yellow = [];

      for (let alerta of alertsResponse.rows) {
        if (alerta.signal_alert === "Señal de Compra") {
          compras.push(alerta.ticker);
        } else if (alerta.signal_alert === "Señal de Venta") {
          ventas.push(alerta.ticker);
        } else {
          yellow.push(alerta.ticker);
        }
      }

      if (compras.length > 0 || ventas.length > 0) {
        // Solo añadir el mensaje si hay al menos una señal de compra o venta

        let mensaje = `<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;"> 

En su portafolio <span style="color: blue; font-weight: bold; text-decoration: underline;"> ${lista.nombre_lista}</span> en el dia de hoy se dispararon las siguientes Señales en el Mediano Plazo:`;

        if (compras.length > 0) {
          mensaje += `<div class="alert buy"><span style="color: green; font-weight: bold; text-decoration: underline;">Señales de Compra:</span> Las acciones dispararon Señales de Compra:  <br/> <br/><span style="font-weight: bold; text-decoration: underline;"> ${compras.join(
            ", "
          )}</span></div>`;
        }
        if (yellow.length > 0) {
          mensaje += `<div class="alert yellow"><span style="font-weight: bold; text-decoration: underline;">Alerta Yellow:</span> En las siguientes acciones se han disparado las alertas Yellow. Le recomendamos proceder con cautela. Estas acciones ameritan su atencion. <br/><br/>
          <span style="font-weight: bold; color:rgba(255, 196, 0, 0.925); text-decoration: underline;">${yellow.join(
            ", "
          )}</span> 
          </div>`;
        }
        if (ventas.length > 0) {
          mensaje += `<div class="alert sell"><span style="color: red; font-weight: bold; text-decoration: underline;">Señal de Venta:</span> Las acciones mencioandas a continuacion han disparado Señal de Venta en el Mediano Plazo.  Tome sus previsiones. <br/> <br/><span style="font-weight: bold; text-decoration: underline;"> ${ventas.join(
            ", "
          )}</span> </div>`;
        }

        mensaje += "</div>"; // Cierra el div
        if (lista.email) {
          // Si la lista tiene un email, agregamos el mensaje a ese email
          if (!mensajesPorEmail[lista.email]) {
            mensajesPorEmail[lista.email] = [];
          }
          mensajesPorEmail[lista.email].push(mensaje);
        } else {
          // Si la lista no tiene email, agregamos a mensajes generales
          mensajesGenerales.push(mensaje);
        }
      }
    }

    // 3. Enviar el correo (Aquí deberías implementar la lógica para enviar un email. Por ahora, solo devolvemos las alertas)
    // Obtener correos desde .env y convertirlos a una cadena para nodemailer
    const recipientEmails = process.env.EMAILS.split(",").join(", ");

    // Establece __filename y __dirname para módulos ES6
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Tu código existente
    const templatePath = path.join(__dirname, "../utils/emailTemplate.html");
    /* const templatePath = path.join(__dirname, "../utils/emailTemplate.html"); */
    const template = fs.readFileSync(templatePath, "utf-8");

    // Junta todos los mensajes en un solo string
    let mensajeCompleto = mensajes.join("");

    for (const email in mensajesPorEmail) {
      // Combina mensajes específicos y generales
      let mensajes = [...mensajesPorEmail[email] /* ...mensajesGenerales */];
      let mensajeCompleto = mensajes.join("");

      const customizedTemplate = template.replace(
        "{{MENSAJE_COMPLETO}}",
        mensajeCompleto
      );

      // Envia el correo
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          /* to: "estefanymeleon@hotmail.com", */
          subject: "Alertas de compra y venta Portafolios - LDMS",
          html: customizedTemplate,
        };

        await sendMail(mailOptions);

        //console.log(`Correo enviado a ${email} correctamente.`);
      } catch (error) {
        console.log(error);
      }
    }

    res.status(200).json({ message: "Mensajes enviados correctamente." });
  } catch (error) {
    console.log(error);
    if (error.code === 11001) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "error de servidor" });
  }
};

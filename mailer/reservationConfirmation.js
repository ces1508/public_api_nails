function template (user, services) {
  return (`
		<table style="border: 0px solid pink;border-collapse: collapse;width: 600px;">
			<tr style="border: 1px solid pink;padding: 10px; padding: 10px; ">
				<th style="border: 1px solid pink;padding: 10px; ">Nombre</th>
				<th style="border: 1px solid pink;padding: 10px; ">Direccion</th>
				<th style="border: 1px solid pink;padding: 10px; ">Telefono</th>
				<th style="border: 1px solid pink;padding: 10px; ">Barrio</th>
			</tr>
			<tr style="border: 1px solid pink;padding: 10px; ">
				<td style="border: 1px solid pink;padding: 10px; ">${user.name}</td>
				<td style="border: 1px solid pink;padding: 10px; ">${user.direction} </td>
				<td style="border: 1px solid pink;padding: 10px; ">${user.phone} </td>
				<td style="border: 1px solid pink;padding: 10px; ">${user.barrio} </td>
			</tr>
			<tr style="border: 1px solid pink;padding: 10px; ">
				<th colspan="2" style="border: 1px solid pink;padding: 10px; ">
					Servicio
				</th>
				<th colspan="2" style="border: 1px solid pink;padding: 10px; ">
					Cantidad
				</th>
			</tr>
			${services.map(service => `<tr style="border: 1px solid pink;padding: 10px; ">
					<td colspan="2" style="border: 1px solid pink;padding: 10px; ">${service.name}</td>
					<td colspan="2" style="border: 1px solid pink;padding: 10px; ">${service.amount}</td>
				</tr>`.trim()).join('')
    }
		</table>
	`
  )
}

module.exports = template

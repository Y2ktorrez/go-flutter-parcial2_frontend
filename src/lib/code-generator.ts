import type { DesignElement, Screen } from "./types";

export function generateFlutterCode(screens: Screen[]): string {
  const themeData = generateThemeData(false);

  // Rutas para cada pantalla
  const routes = screens.map((screen) => `'/${screen.id}': (context) => ${screenClassName(screen.name)}(),`).join("\n");

  // Widgets de cada pantalla
  const screenWidgets = screens.map((screen) => generateScreenWidget(screen)).join("\n\n");

  // Items para la sidebar de navegación
  const sidebarItems = screens
    .map(
      (screen) => `
          ListTile(
            title: Text('${screen.name}'),
            onTap: () {
              Navigator.of(context).pop(); // cierra drawer
              if (ModalRoute.of(context)?.settings.name != '/${screen.id}') {
                Navigator.of(context).pushReplacementNamed('/${screen.id}');
              }
            },
          ),`
    )
    .join("\n");

  return `
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter UI App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        ${themeData}
      ),
      initialRoute: '/${screens[0]?.id}',
      routes: {
        ${routes}
      },
    );
  }
}

// Widget Sidebar común para navegación lateral
class AppSidebar extends StatelessWidget {
  const AppSidebar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        children: [
          const DrawerHeader(
            child: Text(
              'Screens',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ),
          ${sidebarItems}
        ],
      ),
    );
  }
}

// Widgets para cada pantalla (screen)
${screenWidgets}
`;
}

// Genera nombre válido para clase Dart
function screenClassName(name: string): string {
  return name.replace(/\s+/g, "") + "Screen";
}

// Genera cada screen como StatefulWidget con Scaffold que incluye AppSidebar
function generateScreenWidget(screen: Screen): string {
  const className = screenClassName(screen.name);
  const widgetCode = generateWidgetCode(screen.elements);

  // Generar variables de estado para componentes interactivos
  const stateVariables = generateStateVariables(screen.elements);

  return `
  class ${className} extends StatefulWidget {
    const ${className}({Key? key}) : super(key: key);

    @override
    State<${className}> createState() => _${className}State();
  }

  class _${className}State extends State<${className}> {
    ${stateVariables}

    String selectedOption = 'option1';
    
  // Estado para el Checkbox
  bool isCheckboxChecked = false; // Valor inicial

  // Estado para el Switch
  bool isSwitchOn = false; // Valor inicial
    @override
    Widget build(BuildContext context) {
      return Scaffold(
        appBar: AppBar(
          title: Text('${screen.name}'),
        ),
        drawer: const AppSidebar(),
        body: Stack(
          children: [
            ${widgetCode}
          ],
        ),
      );
    }
  }
  `;
}

function generateStateVariables(elements: DesignElement[]): string {
  const stateVars: string[] = [];

  elements.forEach((element, index) => {
    const { type, properties } = element;

    if (type === "switch" && properties.interactive) {
      stateVars.push(`bool _switch${index} = ${properties.value || false};`);
    } else if (type === "checkbox" && properties.interactive) {
      stateVars.push(`bool _checkbox${index} = ${properties.value || false};`);
    } else if (type === "dropdown" && properties.interactive) {
      stateVars.push(`String? _dropdown${index} = ${properties.value ? `'${properties.value}'` : "null"};`);
    }
  });

  return stateVars.join("\n  ");
}

function generateThemeData(isDarkMode: boolean): string {
  return isDarkMode
    ? `
        brightness: Brightness.dark,
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: const Color(0xFF121212),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1E1E1E),
          elevation: 0,
        ),
      `
    : `
        brightness: Brightness.light,
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: Colors.white,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0,
        ),
      `;
}

function generateWidgetCode(elements: DesignElement[]): string {
  if (elements.length === 0) {
    return "// No elements added yet";
  }

  return elements
    .map((element, i) => {
      const positionedWidget = `
  Positioned(
    left: ${element.x.toFixed(1)},
    top: ${element.y.toFixed(1)},
    width: ${element.width.toFixed(1)},
    height: ${element.height.toFixed(1)},
    child: ${generateElementWidget(element, i)},
  ),`;
      return positionedWidget;
    })
    .join("\n");
}

function generateElementWidget(element: DesignElement, index: number): string {
  const { type, properties } = element;

  switch (type) {
    case "button":
      return generateButtonWidget(properties);
    case "textField":
      return generateTextFieldWidget(properties);
    case "card":
      return generateCardWidget(properties);
    case "dynamicTable":
      return generateDynamicTableWidget(properties);
    case "list":
      return generateListWidget(properties);
    case "icon":
      return generateIconWidget(properties);
    case "container":
      return generateContainerWidget(properties);
    case "row":
      return generateRowWidget(properties);
    case "column":
      return generateColumnWidget(properties);
    case "stack":
      return generateStackWidget(properties);
    case "switch":
      return generateSwitchWidget(properties, index);
    case "checkbox":
      return generateCheckboxWithLabelWidget(properties);
    case "radio":
      return generateRadioWidget(properties);
    case "chatInput":
      return generateChatInputWidget(properties);
    case "chatMessage":
      return generateChatMessageWidget(properties);
    case "dropdown":
      return generateDropdownWidget(properties, index);
    case "inputWithLabel":
      return generateInputWithLabelWidget(properties);
    case "switchWithLabel":
      return generateSwitchWithLabelWidget(properties);
    case "radioWithLabel":
      return generateRadioWithLabelWidget(properties);
    case "checkboxWithLabel":
      return generateCheckboxWithLabelWidget(properties);
    default:
      return "Container()";
  }
}

function generateChatInputWidget(properties: Record<string, any>): string {
  const { hint, sendButtonText } = properties;

  return `
  Row(
    children: [
      Expanded(
        child: TextField(
          decoration: InputDecoration(
            hintText: '${hint || "Type a message..."}',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
            ),
            contentPadding: EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
          ),
        ),
      ),
      const SizedBox(width: 8.0),
      ElevatedButton(
        onPressed: () {},
        child: Text('${sendButtonText || "Send"}'),
      ),
    ],
  )`;
}

function generateChatMessageWidget(properties: Record<string, any>): string {
  const { text, sender } = properties;
  const isUser = sender === "user";

  return `
  Align(
    alignment: ${isUser ? "Alignment.centerRight" : "Alignment.centerLeft"},
    child: Container(
      padding: const EdgeInsets.all(12.0),
      margin: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
      constraints: BoxConstraints(maxWidth: 250),
      decoration: BoxDecoration(
        color: ${isUser ? "Colors.blue.shade200" : "Colors.grey.shade300"},
        borderRadius: BorderRadius.circular(12.0),
      ),
      child: Text('${text ?? ""}'),
    ),
  )`;
}

function generateDropdownWidget(properties: Record<string, any>, index: number): string {
  const { label, placeholder, options, value: valueProp } = properties;

  // Parsear opciones
  let parsedOptions = [];
  try {
    parsedOptions = typeof options === "string" ? JSON.parse(options) : options || [];
  } catch (e) {
    parsedOptions = [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
    ];
  }

  // Generar código de items
  const itemsCode = parsedOptions
    .map(
      (item: any) =>
        `DropdownMenuItem<String>(
        value: '${item.value}', 
        child: Text('${item.label}')
      )`
    )
    .join(",\n");

  return `
DropdownButtonFormField<String>(
  decoration: InputDecoration(
    labelText: '${label || "Select"}',
    hintText: '${placeholder || ""}',
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8.0),
    ),
    contentPadding: EdgeInsets.symmetric(
      horizontal: 16.0,
      vertical: 14.0,
    ),
  ),
  isExpanded: true,
  value: selectedOption,
  items: [${itemsCode}],
  onChanged: (String? newValue) {
    if (newValue != null) {
      setState(() {
       selectedOption = newValue;
      });
    }
  },
)`;
}

function generateInputWithLabelWidget(properties: Record<string, any>): string {
  const { label, hint } = properties;

  return `
  Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text('${label || ""}', style: const TextStyle(fontWeight: FontWeight.bold)),
      const SizedBox(height: 4.0),
      TextField(
        decoration: InputDecoration(
          hintText: '${hint || ""}',
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
          ),
        ),
      ),
    ],
  )`;
}

function generateSwitchWithLabelWidget(properties: Record<string, any>): string {
  const { label, value, activeColor } = properties;

  return `
  Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Text('${label || ""}'),
      Switch(
        value: ${!!value},
        activeColor: Color(${hexToArgb(activeColor || "#2196F3")}),
        onChanged: (bool newValue) {},
      ),
    ],
  )`;
}

function generateRadioWithLabelWidget(properties: Record<string, any>): string {
  const { label, value, groupValue } = properties;

  return `
  Row(
    children: [
      Radio<String>(
        value: '${value || "option1"}',
        groupValue: '${groupValue || "option1"}',
        onChanged: (String? newValue) {},
      ),
      Text('${label || ""}'),
    ],
  )`;
}

function generateCheckboxWithLabelWidget(properties: Record<string, any>): string {
  const { label, value, activeColor } = properties;

  return `
  Row(
    children: [
      Checkbox(
        value: isCheckboxChecked,
        activeColor: Color(${hexToArgb(activeColor || "#2196F3")}),
        onChanged: (bool? newValue) {
          setState(() {
            isCheckboxChecked = newValue!; // Actualiza el estado
          });
        },
      ),
      Text('${label || ""}'),
    ],
  )`;
}

function generateButtonWidget(properties: Record<string, any>): string {
  const { text, variant, rounded, color, padding } = properties;

  // Calcular color de texto automáticamente
  const textColor = getContrastingTextColor(color);

  if (variant === "outline") {
    return `
  OutlinedButton(
    onPressed: () {},
    style: OutlinedButton.styleFrom(
      foregroundColor: Color(${hexToArgb(color)}),
      side: BorderSide(color: Color(${hexToArgb(color)})),
      shape: ${rounded ? "const StadiumBorder()" : "RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.0))"},
      padding: EdgeInsets.all(${padding.toFixed(1)}),
    ),
    child: Text(
      '${text}',
      style: TextStyle(
        color: Color(${hexToArgb(color)}),
        fontWeight: FontWeight.w500,
      ),
    ),
  )`;
  } else {
    return `
  ElevatedButton(
    onPressed: () {},
    style: ElevatedButton.styleFrom(
      backgroundColor: Color(${hexToArgb(color)}),
      foregroundColor: Color(${hexToArgb(textColor)}),
      shape: ${rounded ? "const StadiumBorder()" : "RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.0))"},
      padding: EdgeInsets.all(${padding.toFixed(1)}),
      elevation: 2,
    ),
    child: Text(
      '${text}',
      style: TextStyle(
        fontWeight: FontWeight.w600,
        fontSize: 16,
      ),
    ),
  )`;
  }
}

function getContrastingTextColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith("#")) {
    return "#FFFFFF";
  }

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calcular luminancia
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Retornar blanco para colores oscuros, negro para colores claros
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

function generateTextFieldWidget(properties: Record<string, any>): string {
  const { hint, label, hasIcon, icon, validation } = properties;

  return `
  TextField(
    decoration: InputDecoration(
      labelText: '${label}',
      hintText: '${hint}',
      ${hasIcon ? `prefixIcon: const Icon(Icons.${icon || "search"}),` : ""}
      ${validation ? "errorText: 'Please enter a valid value'," : ""}
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8.0),
      ),
    ),
  )`;
}

function generateCardWidget(properties: Record<string, any>): string {
  const { title, subtitle, content, showImage, imageHeight, elevation, borderRadius, color, padding } = properties;

  return `
  Card(
    elevation: ${elevation.toFixed(1)},
    color: Color(${hexToArgb(color)}),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(${borderRadius.toFixed(1)}),
    ),
    child: Padding(
      padding: EdgeInsets.all(${padding.toFixed(1)}),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ${
            showImage
              ? `
          Container(
            height: ${imageHeight.toFixed(1)},
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(8.0),
            ),
            child: Icon(
              Icons.image,
              size: 48,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 12.0),`
              : ""
          }
          Text(
            '${title || "Card Title"}',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          ${
            subtitle
              ? `
          const SizedBox(height: 4.0),
          Text(
            '${subtitle}',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
          ),`
              : ""
          }
          const SizedBox(height: 8.0),
          Text(
            '${content || "Card content goes here..."}',
            style: const TextStyle(fontSize: 14),
          ),
        ],
      ),
    ),
  )`;
}

function generateListWidget(properties: Record<string, any>): string {
  const { direction, data, itemHeight } = properties;

  let parsedData = [];
  try {
    parsedData = typeof data === "string" ? JSON.parse(data) : data || [];
  } catch (e) {
    parsedData = [
      { title: "Item 1", subtitle: "Description 1", icon: "star" },
      { title: "Item 2", subtitle: "Description 2", icon: "favorite" },
    ];
  }

  const dataString = JSON.stringify(parsedData).replace(/"/g, '\\"');

  if (direction === "horizontal") {
    return `
  Builder(
    builder: (context) {
      final List<Map<String, dynamic>> listData = [
        ${parsedData
          .map(
            (item: any) =>
              `{"title": "${item.title || ""}", "subtitle": "${item.subtitle || ""}", "icon": "${item.icon || "star"}"}`
          )
          .join(",\n      ")}
      ];
      
      return SizedBox(
        height: ${itemHeight.toFixed(1)},
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          itemCount: listData.length,
          itemBuilder: (context, index) {
            final item = listData[index];
            return Container(
              width: 200.0,
              margin: const EdgeInsets.only(right: 8.0),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8.0),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.2),
                    spreadRadius: 1,
                    blurRadius: 3,
                  ),
                ],
              ),
              child: ListTile(
                leading: Icon(
                  _getIconData(item['icon']),
                  color: Colors.blue,
                ),
                title: Text(
                  item['title'],
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
                subtitle: Text(item['subtitle']),
              ),
            );
          },
        ),
      );
    },
  )`;
  } else {
    return `
  Builder(
    builder: (context) {
      final List<Map<String, dynamic>> listData = [
        ${parsedData
          .map(
            (item: any) =>
              `{"title": "${item.title || ""}", "subtitle": "${item.subtitle || ""}", "icon": "${item.icon || "star"}"}`
          )
          .join(",\n      ")}
      ];
      
      return ListView.builder(
        itemCount: listData.length,
        itemBuilder: (context, index) {
          final item = listData[index];
          return Container(
            margin: const EdgeInsets.only(bottom: 8.0),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8.0),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.2),
                  spreadRadius: 1,
                  blurRadius: 3,
                ),
              ],
            ),
            child: ListTile(
              leading: Icon(
                _getIconData(item['icon']),
                color: Colors.blue,
              ),
              title: Text(
                item['title'],
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              subtitle: Text(item['subtitle']),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            ),
          );
        },
      );
    },
  )`;
  }
}

function generateIconWidget(properties: Record<string, any>): string {
  const { name, color, size } = properties;

  return `
  Icon(
    Icons.${name || "star"},
    color: Color(${hexToArgb(color)}),
    size: ${size.toFixed(1)},
  )`;
}

function generateContainerWidget(properties: Record<string, any>): string {
  const { color, padding, margin, borderRadius } = properties;

  return `
  Container(
    padding: EdgeInsets.all(${padding.toFixed(1)}),
    margin: EdgeInsets.all(${margin.toFixed(1)}),
    decoration: BoxDecoration(
      color: Color(${hexToArgb(color)}),
      borderRadius: BorderRadius.circular(${borderRadius.toFixed(1)}),
    ),
  )`;
}

function generateRowWidget(properties: Record<string, any>): string {
  const { mainAxisAlignment, crossAxisAlignment, padding } = properties;

  let mainAxisAlignmentValue = "MainAxisAlignment.start";
  if (mainAxisAlignment === "center") mainAxisAlignmentValue = "MainAxisAlignment.center";
  if (mainAxisAlignment === "end") mainAxisAlignmentValue = "MainAxisAlignment.end";
  if (mainAxisAlignment === "spaceBetween") mainAxisAlignmentValue = "MainAxisAlignment.spaceBetween";
  if (mainAxisAlignment === "spaceAround") mainAxisAlignmentValue = "MainAxisAlignment.spaceAround";
  if (mainAxisAlignment === "spaceEvenly") mainAxisAlignmentValue = "MainAxisAlignment.spaceEvenly";

  let crossAxisAlignmentValue = "CrossAxisAlignment.start";
  if (crossAxisAlignment === "center") crossAxisAlignmentValue = "CrossAxisAlignment.center";
  if (crossAxisAlignment === "end") crossAxisAlignmentValue = "CrossAxisAlignment.end";
  if (crossAxisAlignment === "stretch") crossAxisAlignmentValue = "CrossAxisAlignment.stretch";

  return `
  Padding(
    padding: EdgeInsets.all(${padding.toFixed(1)}),
    child: Row(
      mainAxisAlignment: ${mainAxisAlignmentValue},
      crossAxisAlignment: ${crossAxisAlignmentValue},
      children: [
        Container(
          width: 30.0,
          height: 30.0,
          color: Colors.grey.shade300,
        ),
        const SizedBox(width: 8.0),
        Container(
          width: 30.0,
          height: 30.0,
          color: Colors.grey.shade300,
        ),
        const SizedBox(width: 8.0),
        Container(
          width: 30.0,
          height: 30.0,
          color: Colors.grey.shade300,
        ),
      ],
    ),
  )`;
}

function generateColumnWidget(properties: Record<string, any>): string {
  const { mainAxisAlignment, crossAxisAlignment, padding } = properties;

  let mainAxisAlignmentValue = "MainAxisAlignment.start";
  if (mainAxisAlignment === "center") mainAxisAlignmentValue = "MainAxisAlignment.center";
  if (mainAxisAlignment === "end") mainAxisAlignmentValue = "MainAxisAlignment.end";
  if (mainAxisAlignment === "spaceBetween") mainAxisAlignmentValue = "MainAxisAlignment.spaceBetween";
  if (mainAxisAlignment === "spaceAround") mainAxisAlignmentValue = "MainAxisAlignment.spaceAround";
  if (mainAxisAlignment === "spaceEvenly") mainAxisAlignmentValue = "MainAxisAlignment.spaceEvenly";

  let crossAxisAlignmentValue = "CrossAxisAlignment.start";
  if (crossAxisAlignment === "center") crossAxisAlignmentValue = "CrossAxisAlignment.center";
  if (crossAxisAlignment === "end") crossAxisAlignmentValue = "CrossAxisAlignment.end";
  if (crossAxisAlignment === "stretch") crossAxisAlignmentValue = "CrossAxisAlignment.stretch";

  return `
  Padding(
    padding: EdgeInsets.all(${padding.toFixed(1)}),
    child: Column(
      mainAxisAlignment: ${mainAxisAlignmentValue},
      crossAxisAlignment: ${crossAxisAlignmentValue},
      children: [
        Container(
          width: 100.0,
          height: 30.0,
          color: Colors.grey.shade300,
        ),
        const SizedBox(height: 8.0),
        Container(
          width: 100.0,
          height: 30.0,
          color: Colors.grey.shade300,
        ),
        const SizedBox(height: 8.0),
        Container(
          width: 100.0,
          height: 30.0,
          color: Colors.grey.shade300,
        ),
      ],
    ),
  )`;
}

function generateStackWidget(properties: Record<string, any>): string {
  const { alignment, padding } = properties;

  let alignmentValue = "Alignment.topLeft";
  if (alignment === "center") alignmentValue = "Alignment.center";
  if (alignment === "topCenter") alignmentValue = "Alignment.topCenter";
  if (alignment === "topRight") alignmentValue = "Alignment.topRight";
  if (alignment === "centerLeft") alignmentValue = "Alignment.centerLeft";
  if (alignment === "centerRight") alignmentValue = "Alignment.centerRight";
  if (alignment === "bottomLeft") alignmentValue = "Alignment.bottomLeft";
  if (alignment === "bottomCenter") alignmentValue = "Alignment.bottomCenter";
  if (alignment === "bottomRight") alignmentValue = "Alignment.bottomRight";

  return `
  Padding(
    padding: EdgeInsets.all(${padding.toFixed(1)}),
    child: Stack(
      alignment: ${alignmentValue},
      children: [
        Container(
          width: 60.0,
          height: 60.0,
          color: Colors.grey.shade200,
        ),
        Container(
          width: 40.0,
          height: 40.0,
          color: Colors.grey.shade300,
        ),
      ],
    ),
  )`;
}

function generateSwitchWidget(properties: Record<string, any>, index: number): string {
  const { label, value, activeColor, inactiveColor, interactive } = properties;

  if (!interactive) {
    return `
  Switch(
    value: isSwitchOn,
    activeColor: Color(${hexToArgb(activeColor)}),
    inactiveTrackColor: Color(${hexToArgb(inactiveColor)}),
    onChanged: (bool newValue) {
      setState(() {
        isSwitchOn = newValue; // Actualiza el estado
      });
    },
  )`;
  }

  return `
  ${
    label
      ? `
  Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Text('${label}'),
      Switch(
        value: _switch${index},
        activeColor: Color(${hexToArgb(activeColor)}),
        inactiveTrackColor: Color(${hexToArgb(inactiveColor)}),
        onChanged: (bool newValue) {
          setState(() {
            _switch${index} = newValue;
          });
        },
      ),
    ],
  )`
      : `
  Switch(
    value: _switch${index},
    activeColor: Color(${hexToArgb(activeColor)}),
    inactiveTrackColor: Color(${hexToArgb(inactiveColor)}),
    onChanged: (bool newValue) {
      setState(() {
        _switch${index} = newValue;
      });
    },
  )`
  }`;
}

function generateRadioWidget(properties: Record<string, any>): string {
  const { value, activeColor, groupValue } = properties;

  return `
  Radio<String>(
    value: '${value ? "option1" : "option2"}',
    groupValue: '${groupValue}',
    activeColor: Color(${hexToArgb(activeColor)}),
    onChanged: (value) {},
  )`;
}

function generateDynamicTableWidget(properties: Record<string, any>): string {
  const { title, columns, data, showHeader, showBorder, striped, sortable } = properties;

  let parsedColumns = [];
  let parsedData = [];

  try {
    parsedColumns = typeof columns === "string" ? JSON.parse(columns) : columns || [];
    parsedData = typeof data === "string" ? JSON.parse(data) : data || [];
  } catch (e) {
    parsedColumns = [{ id: "col1", title: "Column 1", width: 100 }];
    parsedData = [{ col1: "Data 1" }];
  }

  const columnsCode = parsedColumns
    .map(
      (col: any) =>
        `DataColumn(
      label: Text('${col.title}'),
      ${
        sortable
          ? `onSort: (columnIndex, ascending) {
        // Implement sorting logic here
      },`
          : ""
      }
    )`
    )
    .join(",\n");

  const rowsCode = parsedData
    .map(
      (row: any) =>
        `DataRow(cells: [${parsedColumns.map((col: any) => `DataCell(Text('${row[col.id] ?? ""}'))`).join(", ")}])`
    )
    .join(",\n");

  return `
  Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      ${
        title
          ? `
      Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          '${title}',
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),`
          : ""
      }
      Expanded(
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            ${showBorder ? "border: TableBorder.all(color: Colors.grey.shade300)," : ""}
            ${striped ? "decoration: BoxDecoration(color: Colors.grey.shade50)," : ""}
            columns: [
              ${columnsCode}
            ],
            rows: [
              ${rowsCode}
            ],
          ),
        ),
      ),
    ],
  )`;
}

// Helper function to convert hex color to ARGB integer for Flutter
function hexToArgb(hex: string): string {
  if (!hex || !hex.startsWith("#")) {
    return "0xFF000000";
  }

  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);

  return `0xFF${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
